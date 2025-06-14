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
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    const isFirstOfMonth = today.getDate() === 1

    console.log(`Monthly rent scheduler triggered on ${today.toISOString()}`)
    console.log(`Is first of month: ${isFirstOfMonth}`)

    if (!isFirstOfMonth) {
      return new Response(
        JSON.stringify({ 
          message: 'Not the first day of the month, skipping rent generation',
          date: today.toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Get all active rental customers
    const { data: rentalCustomers, error: customerError } = await supabaseClient
      .from('customers')
      .select(`
        id,
        name,
        monthly_rent,
        join_date,
        status,
        partner_id
      `)
      .eq('payment_type', 'monthly_rent')
      .eq('status', 'active')

    if (customerError) {
      console.error('Error fetching rental customers:', customerError)
      throw customerError
    }

    console.log(`Found ${rentalCustomers?.length || 0} active rental customers`)

    if (!rentalCustomers || rentalCustomers.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No active rental customers found',
          processedCount: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const processedCustomers = []
    const errors = []

    // Process each rental customer
    for (const customer of rentalCustomers) {
      try {
        // Check if rent for current month already exists
        const rentMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
        
        const { data: existingRent } = await supabaseClient
          .from('monthly_rents')
          .select('id')
          .eq('customer_id', customer.id)
          .eq('rent_month', rentMonth)
          .single()

        if (existingRent) {
          console.log(`Rent already exists for customer ${customer.name} for ${rentMonth}`)
          continue
        }

        // Calculate due date (5th of current month)
        const dueDate = new Date(currentYear, currentMonth - 1, 5)
        
        // Create new monthly rent record
        const { data: newRent, error: rentError } = await supabaseClient
          .from('monthly_rents')
          .insert({
            customer_id: customer.id,
            rent_month: rentMonth,
            amount: customer.monthly_rent,
            due_date: dueDate.toISOString().split('T')[0],
            payment_status: 'due',
            paid_amount: 0,
            remaining_amount: customer.monthly_rent,
            is_prorated: false,
            created_at: today.toISOString(),
            updated_at: today.toISOString()
          })
          .select()
          .single()

        if (rentError) {
          console.error(`Error creating rent for customer ${customer.name}:`, rentError)
          errors.push({
            customerId: customer.id,
            customerName: customer.name,
            error: rentError.message
          })
          continue
        }

        processedCustomers.push({
          customerId: customer.id,
          customerName: customer.name,
          rentAmount: customer.monthly_rent,
          dueDate: dueDate.toISOString().split('T')[0],
          rentId: newRent.id
        })

        console.log(`Successfully created rent for ${customer.name}: ₹${customer.monthly_rent}`)

      } catch (error) {
        console.error(`Error processing customer ${customer.name}:`, error)
        errors.push({
          customerId: customer.id,
          customerName: customer.name,
          error: error.message
        })
      }
    }

    // Update customer next_due_date fields
    for (const processed of processedCustomers) {
      await supabaseClient
        .from('customers')
        .update({
          next_due_date: processed.dueDate,
          last_payment_date: null, // Will be updated when payment is made
          updated_at: today.toISOString()
        })
        .eq('id', processed.customerId)
    }

    const result = {
      message: 'Monthly rent generation completed',
      date: today.toISOString(),
      month: rentMonth,
      totalCustomers: rentalCustomers.length,
      processedCount: processedCustomers.length,
      errorCount: errors.length,
      processedCustomers,
      errors
    }

    console.log('Monthly rent generation result:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Monthly rent scheduler error:', error)
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