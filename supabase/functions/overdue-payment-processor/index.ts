import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const today = new Date()
    console.log(`Overdue payment processor triggered on ${today.toISOString()}`)

    // Calculate cutoff dates for overdue status
    const rentOverdueCutoff = new Date(today)
    rentOverdueCutoff.setDate(today.getDate() - 1) // 1 day after due date (5th becomes overdue on 6th)
    
    const emiOverdueCutoff = new Date(today)
    emiOverdueCutoff.setDate(today.getDate() - 5) // 5 days after due date

    console.log(`Rent overdue cutoff: ${rentOverdueCutoff.toISOString()}`)
    console.log(`EMI overdue cutoff: ${emiOverdueCutoff.toISOString()}`)

    // Update overdue rental payments
    const { data: overdueRents, error: rentUpdateError } = await supabaseClient
      .from('monthly_rents')
      .update({
        payment_status: 'overdue',
        updated_at: today.toISOString()
      })
      .lt('due_date', rentOverdueCutoff.toISOString().split('T')[0])
      .in('payment_status', ['due', 'partial'])
      .gt('remaining_amount', 0)
      .select(`
        id,
        customer_id,
        rent_month,
        amount,
        remaining_amount,
        due_date,
        customers!inner(name, phone)
      `)

    if (rentUpdateError) {
      console.error('Error updating overdue rents:', rentUpdateError)
      throw rentUpdateError
    }

    // Update overdue EMI payments
    const { data: overdueEmis, error: emiUpdateError } = await supabaseClient
      .from('emis')
      .update({
        payment_status: 'overdue',
        updated_at: today.toISOString()
      })
      .lt('due_date', emiOverdueCutoff.toISOString().split('T')[0])
      .in('payment_status', ['due', 'partial'])
      .gt('remaining_amount', 0)
      .select(`
        id,
        customer_id,
        emi_number,
        amount,
        remaining_amount,
        due_date,
        customers!inner(name, phone)
      `)

    if (emiUpdateError) {
      console.error('Error updating overdue EMIs:', emiUpdateError)
      throw emiUpdateError
    }

    // Get customers with overdue payments for notifications
    const overdueCustomerIds = [
      ...(overdueRents?.map(r => r.customer_id) || []),
      ...(overdueEmis?.map(e => e.customer_id) || [])
    ]
    const uniqueOverdueCustomerIds = [...new Set(overdueCustomerIds)]

    // Calculate overdue amounts per customer
    const customerOverdueAmounts = new Map()
    
    for (const rent of overdueRents || []) {
      const current = customerOverdueAmounts.get(rent.customer_id) || { rents: 0, emis: 0, total: 0 }
      current.rents += rent.remaining_amount
      current.total += rent.remaining_amount
      customerOverdueAmounts.set(rent.customer_id, current)
    }

    for (const emi of overdueEmis || []) {
      const current = customerOverdueAmounts.get(emi.customer_id) || { rents: 0, emis: 0, total: 0 }
      current.emis += emi.remaining_amount
      current.total += emi.remaining_amount
      customerOverdueAmounts.set(emi.customer_id, current)
    }

    // Update customer overdue flags
    if (uniqueOverdueCustomerIds.length > 0) {
      await supabaseClient
        .from('customers')
        .update({
          status: 'active', // Keep active but track overdue in payment records
          updated_at: today.toISOString()
        })
        .in('id', uniqueOverdueCustomerIds)
    }

    // Prepare notification data
    const notifications = []
    for (const customerId of uniqueOverdueCustomerIds) {
      const amounts = customerOverdueAmounts.get(customerId)
      if (amounts) {
        notifications.push({
          customerId,
          overdueRentAmount: amounts.rents,
          overdueEmiAmount: amounts.emis,
          totalOverdueAmount: amounts.total
        })
      }
    }

    const result = {
      message: 'Overdue payment processing completed',
      timestamp: today.toISOString(),
      rentOverdueCutoff: rentOverdueCutoff.toISOString(),
      emiOverdueCutoff: emiOverdueCutoff.toISOString(),
      overdueRentsCount: overdueRents?.length || 0,
      overdueEmisCount: overdueEmis?.length || 0,
      affectedCustomersCount: uniqueOverdueCustomerIds.length,
      overdueRents: overdueRents || [],
      overdueEmis: overdueEmis || [],
      notifications
    }

    console.log('Overdue payment processing result:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Overdue payment processor error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})