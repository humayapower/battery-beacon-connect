# Visual Workflow Diagrams

This document contains comprehensive Mermaid diagrams illustrating all major workflows in the Battery Beacon Connect system.

## Table of Contents
1. [User Authentication Flow](#user-authentication-flow)
2. [Partner Management Flow](#partner-management-flow)
3. [Customer Onboarding Flow](#customer-onboarding-flow)
4. [Battery Lifecycle Flow](#battery-lifecycle-flow)
5. [Payment Processing Flow](#payment-processing-flow)
6. [EMI Payment Journey](#emi-payment-journey)
7. [Monthly Rent Cycle](#monthly-rent-cycle)
8. [Overdue Management Flow](#overdue-management-flow)
9. [Credit System Flow](#credit-system-flow)
10. [Data Access Flow (RLS)](#data-access-flow-rls)

---

## User Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Login Page
    participant Auth as AuthContext
    participant Hash as Password Hash
    participant RPC as Supabase RPC
    participant DB as Database
    participant LS as LocalStorage

    User->>UI: Enter credentials
    UI->>Auth: signIn(username, password)
    Auth->>Hash: hashPassword(password)
    Hash-->>Auth: hashedPassword
    Auth->>RPC: authenticate_user(username, hash)
    RPC->>DB: Query users table
    
    alt Valid Credentials
        DB-->>RPC: User data
        RPC-->>Auth: User object
        Auth->>LS: Store user session
        Auth->>UI: Update user state
        UI->>User: Redirect to dashboard
    else Invalid Credentials
        DB-->>RPC: No match
        RPC-->>Auth: Error
        Auth->>UI: Show error message
        UI->>User: Display error
    end
```

### Session Management Flow

```mermaid
flowchart TD
    Start([App Starts]) --> CheckLS{LocalStorage<br/>has session?}
    CheckLS -->|Yes| Parse[Parse user data]
    CheckLS -->|No| ShowAuth[Show Login Page]
    Parse --> Validate{Valid JSON?}
    Validate -->|Yes| SetUser[Set user context]
    Validate -->|No| Clear[Clear localStorage]
    Clear --> ShowAuth
    SetUser --> CheckRole{Check user role}
    CheckRole -->|Admin| AdminDash[Redirect to<br/>Admin Dashboard]
    CheckRole -->|Partner| PartnerDash[Redirect to<br/>Partner Dashboard]
    ShowAuth --> End([Wait for login])
    AdminDash --> End
    PartnerDash --> End
```

---

## Partner Management Flow

```mermaid
flowchart TD
    Start([Admin Creates Partner]) --> Form[Fill Partner Form]
    Form --> Validate{Form Valid?}
    Validate -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> Form
    Validate -->|Yes| HashPwd[Hash Password<br/>SHA-256]
    HashPwd --> CallRPC[Call create_user RPC]
    CallRPC --> InsertDB[(Insert into<br/>users table)]
    InsertDB --> Success{Insert<br/>Success?}
    Success -->|No| Error[Show Error Message]
    Success -->|Yes| Invalidate[Invalidate<br/>Partners Query]
    Invalidate --> Refetch[Refetch Partners List]
    Refetch --> Toast[Show Success Toast]
    Toast --> CloseModal[Close Modal]
    CloseModal --> End([Partner Created])
    Error --> End
```

### Partner Profile Management

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Partner Table
    participant Modal as Edit Modal
    participant API as Supabase Client
    participant DB as Database
    participant Cache as React Query

    Admin->>UI: Click Edit Partner
    UI->>Modal: Open with partner data
    Admin->>Modal: Update information
    Modal->>Modal: Validate changes
    Modal->>API: Update partner record
    API->>DB: Execute UPDATE query
    DB-->>API: Confirm update
    API->>Cache: Invalidate partners query
    Cache->>API: Refetch partners
    API->>DB: SELECT partners
    DB-->>API: Return updated list
    API-->>UI: Display updated data
    UI->>Admin: Show success toast
```

---

## Customer Onboarding Flow

### Complete Customer Creation Journey

```mermaid
flowchart TD
    Start([Partner Clicks<br/>Add Customer]) --> Modal[Open Customer Modal]
    Modal --> FillBasic[Fill Basic Info:<br/>Name, Phone, Address]
    FillBasic --> UploadDocs[Upload Documents:<br/>Photo, ID Proof]
    UploadDocs --> SelectPayment{Select Payment Type}
    
    SelectPayment -->|EMI| EMIFields[Fill EMI Details:<br/>Total, Down Payment,<br/>EMI Count, Amount]
    SelectPayment -->|Monthly Rent| RentFields[Fill Rent Details:<br/>Security Deposit,<br/>Monthly Rent]
    SelectPayment -->|Purchase| PurchaseFields[Fill Purchase:<br/>Amount]
    
    EMIFields --> SelectBattery
    RentFields --> SelectBattery
    PurchaseFields --> SelectBattery
    
    SelectBattery[Select Battery] --> Validate{Form Valid?}
    Validate -->|No| Errors[Show Errors]
    Errors --> Modal
    
    Validate -->|Yes| Submit[Submit Form]
    Submit --> UploadFiles[Upload Files<br/>to Storage]
    UploadFiles --> CreateCustomer[(Insert Customer<br/>Record)]
    
    CreateCustomer --> TriggerFired{Database<br/>Trigger}
    
    TriggerFired -->|EMI Type| GenEMI[Generate EMI Schedule:<br/>Create N EMI records]
    TriggerFired -->|Rent Type| GenRent[Generate First Rent:<br/>Pro-rated if mid-month]
    TriggerFired -->|Purchase| SkipGen[Skip Schedule<br/>Generation]
    
    GenEMI --> CreateCredit
    GenRent --> CreateCredit
    SkipGen --> CreateCredit
    
    CreateCredit[(Create Customer<br/>Credit Record)] --> UpdateBattery
    UpdateBattery[(Update Battery:<br/>Assign to Customer)] --> Invalidate
    
    Invalidate[Invalidate Cache:<br/>Customers, Batteries] --> Refetch
    Refetch[Refetch Data] --> Success[Show Success Toast]
    Success --> Redirect{Payment Type?}
    
    Redirect -->|EMI/Rent| ShowBilling[Open Billing View]
    Redirect -->|Purchase| CloseModal[Close Modal]
    
    ShowBilling --> End([Customer Created])
    CloseModal --> End
```

### Document Upload Detail

```mermaid
sequenceDiagram
    actor Partner
    participant Form as Customer Form
    participant Upload as File Upload Component
    participant Storage as Supabase Storage
    participant Bucket as customer-documents

    Partner->>Form: Select customer photo
    Form->>Upload: Handle file selection
    Upload->>Upload: Validate file (type, size)
    
    alt Valid File
        Upload->>Storage: Upload to bucket
        Storage->>Bucket: Store file at path:<br/>customer_id/photo.jpg
        Bucket-->>Storage: File URL
        Storage-->>Upload: Public URL
        Upload->>Form: Set photo_url field
        Form->>Partner: Show preview
    else Invalid File
        Upload->>Partner: Show error message
    end
    
    Partner->>Form: Select ID proof
    Form->>Upload: Handle Aadhaar front
    Upload->>Storage: Upload aadhaar_front
    Storage->>Bucket: Store file
    Bucket-->>Form: URL saved
    
    Partner->>Form: Upload Aadhaar back
    Form->>Upload: Handle Aadhaar back
    Upload->>Storage: Upload aadhaar_back
    Storage->>Bucket: Store file
    Bucket-->>Form: All URLs saved
```

---

## Battery Lifecycle Flow

```mermaid
stateDiagram-v2
    [*] --> Procured: Admin/Partner<br/>adds battery
    
    Procured --> Available: Assigned to<br/>Partner
    
    Available --> Assigned: Assigned to<br/>Customer
    
    Assigned --> Maintenance: Battery issue<br/>reported
    Maintenance --> Assigned: Maintenance<br/>complete
    
    Assigned --> Available: Customer<br/>returns battery
    
    Available --> Decommissioned: Battery<br/>end of life
    Assigned --> Decommissioned: Permanent<br/>damage
    
    Decommissioned --> [*]
    
    note right of Available
        Battery is with partner
        but not assigned to
        any customer
    end note
    
    note right of Assigned
        Battery is with
        customer and payment
        is being tracked
    end note
```

### Battery Status Update Trigger Flow

```mermaid
flowchart TD
    Event([Battery Record<br/>Updated]) --> Trigger{Database Trigger<br/>Fires}
    Trigger --> CheckPartner{partner_id<br/>NULL?}
    CheckPartner -->|Yes| SetAvailable1[Status = 'available']
    CheckPartner -->|No| CheckCustomer{customer_id<br/>NULL?}
    CheckCustomer -->|Yes| SetAvailable2[Status = 'available']
    CheckCustomer -->|No| SetAssigned[Status = 'assigned']
    SetAvailable1 --> UpdateTimestamp
    SetAvailable2 --> UpdateTimestamp
    SetAssigned --> UpdateTimestamp
    UpdateTimestamp[Set updated_at<br/>= now()] --> Return([Return Updated<br/>Record])
```

---

## Payment Processing Flow

### Comprehensive Payment Distribution

```mermaid
flowchart TD
    Start([Partner Receives<br/>Payment]) --> OpenModal[Open Payment Modal]
    OpenModal --> EnterAmount[Enter Payment Amount]
    EnterAmount --> SelectType{Select Payment Type}
    SelectType -->|EMI Only| SetEMI[paymentType = 'emi']
    SelectType -->|Rent Only| SetRent[paymentType = 'rent']
    SelectType -->|Auto Distribute| SetAuto[paymentType = 'auto']
    
    SetEMI --> FetchDues
    SetRent --> FetchDues
    SetAuto --> FetchDues
    
    FetchDues[Fetch Unpaid EMIs<br/>and Rents] --> CheckType{Payment Type?}
    
    CheckType -->|EMI| PrioritizeEMI[Prioritize Overdue EMIs]
    CheckType -->|Rent| PrioritizeRent[Prioritize Overdue Rents]
    CheckType -->|Auto| PrioritizeBoth[Prioritize All Overdue]
    
    PrioritizeEMI --> DistributeEMI
    PrioritizeRent --> DistributeRent
    PrioritizeBoth --> DistributeAuto
    
    DistributeEMI[Distribute to EMIs:<br/>1. Overdue EMIs<br/>2. Due EMIs<br/>3. Partial EMIs] --> CheckRemaining1
    
    DistributeRent[Distribute to Rents:<br/>1. Overdue Rents<br/>2. Due Rents<br/>3. Partial Rents] --> CheckRemaining2
    
    DistributeAuto[Smart Distribution:<br/>1. All Overdue<br/>2. All Due<br/>3. All Partial] --> CheckRemaining3
    
    CheckRemaining1{Amount<br/>Remaining?}
    CheckRemaining2{Amount<br/>Remaining?}
    CheckRemaining3{Amount<br/>Remaining?}
    
    CheckRemaining1 -->|Yes| AddCredit1[Add to Credit]
    CheckRemaining1 -->|No| ProcessPayments1
    CheckRemaining2 -->|Yes| AddCredit2[Add to Credit]
    CheckRemaining2 -->|No| ProcessPayments2
    CheckRemaining3 -->|Yes| AddCredit3[Add to Credit]
    CheckRemaining3 -->|No| ProcessPayments3
    
    AddCredit1 --> ProcessPayments1
    AddCredit2 --> ProcessPayments2
    AddCredit3 --> ProcessPayments3
    
    ProcessPayments1[Process Payment<br/>Updates] --> UpdateEMI
    ProcessPayments2[Process Payment<br/>Updates] --> UpdateRent
    ProcessPayments3[Process Payment<br/>Updates] --> UpdateBoth
    
    UpdateEMI[(Update EMI Records:<br/>paid_amount,<br/>remaining_amount,<br/>payment_status)] --> CreateTrans1
    
    UpdateRent[(Update Rent Records:<br/>paid_amount,<br/>remaining_amount,<br/>payment_status)] --> CreateTrans2
    
    UpdateBoth[(Update Both:<br/>EMI and Rent<br/>Records)] --> CreateTrans3
    
    CreateTrans1[(Create Transaction<br/>Records)] --> UpdateCredit1
    CreateTrans2[(Create Transaction<br/>Records)] --> UpdateCredit2
    CreateTrans3[(Create Transaction<br/>Records)] --> UpdateCredit3
    
    UpdateCredit1[(Update Customer<br/>Credit Balance)] --> Invalidate
    UpdateCredit2[(Update Customer<br/>Credit Balance)] --> Invalidate
    UpdateCredit3[(Update Customer<br/>Credit Balance)] --> Invalidate
    
    Invalidate[Invalidate Cache:<br/>EMIs, Rents,<br/>Transactions, Credits] --> Success
    
    Success[Show Success Toast] --> PrintReceipt{Print Receipt?}
    PrintReceipt -->|Yes| GenerateReceipt[Generate PDF Receipt]
    PrintReceipt -->|No| Close
    GenerateReceipt --> Close[Close Modal]
    Close --> End([Payment Complete])
```

### Payment Status Calculation

```mermaid
flowchart TD
    Payment([Payment Made]) --> CalcRemaining[Calculate:<br/>Remaining = Amount - Paid]
    CalcRemaining --> CheckRemaining{Remaining<br/>Amount?}
    CheckRemaining -->|= 0| SetPaid[Status = 'paid']
    CheckRemaining -->|> 0 AND<br/>< Amount| SetPartial[Status = 'partial']
    CheckRemaining -->|= Amount| CheckDate{Past<br/>Due Date?}
    CheckDate -->|Yes| SetOverdue[Status = 'overdue']
    CheckDate -->|No| SetDue[Status = 'due']
    SetPaid --> UpdateDB
    SetPartial --> CheckDueDate{Past<br/>Due Date?}
    CheckDueDate -->|Yes| SetOverdue
    CheckDueDate -->|No| UpdateDB
    SetOverdue --> UpdateDB
    SetDue --> UpdateDB
    UpdateDB[(Update Record<br/>in Database)] --> End([Status Updated])
```

---

## EMI Payment Journey

```mermaid
flowchart TD
    Start([Customer Assigned<br/>with EMI Plan]) --> Trigger{Database Trigger<br/>Fires After Insert}
    Trigger --> GenSchedule[Generate EMI Schedule<br/>Function Called]
    GenSchedule --> Loop[For i = 1 to emi_count]
    Loop --> CalcDue[Calculate Due Date:<br/>join_date + i months + 5 days]
    CalcDue --> CreateEMI[(Insert EMI Record:<br/>emi_number = i<br/>amount = emi_amount<br/>due_date = calculated<br/>status = 'due')]
    CreateEMI --> CheckMore{More EMIs<br/>to create?}
    CheckMore -->|Yes| Loop
    CheckMore -->|No| SetNext[Set next_due_date<br/>on customer]
    SetNext --> Complete([EMI Schedule<br/>Generated])
    
    Complete --> WaitDue[Wait for Due Date]
    WaitDue --> DueReached([Due Date Reached])
    DueReached --> Notify[Notify Partner]
    Notify --> WaitPayment{Payment<br/>Received?}
    
    WaitPayment -->|Yes| ProcessPmt[Process Payment]
    ProcessPmt --> UpdateStatus1[Update Status<br/>to 'paid' or 'partial']
    UpdateStatus1 --> CheckNext{More EMIs<br/>pending?}
    CheckNext -->|Yes| WaitDue
    CheckNext -->|No| EMIComplete([All EMIs Paid])
    
    WaitPayment -->|No| CheckOverdue{5 days<br/>past due?}
    CheckOverdue -->|No| WaitPayment
    CheckOverdue -->|Yes| MarkOverdue[Status = 'overdue']
    MarkOverdue --> WaitPayment
```

### EMI Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Due: EMI Created
    
    Due --> Partial: Partial Payment<br/>(0 < paid < amount)
    Due --> Paid: Full Payment<br/>(paid = amount)
    Due --> Overdue: Due Date Passed<br/>(remaining > 0)
    
    Partial --> Paid: Remaining Paid
    Partial --> Overdue: Due Date Passed
    
    Overdue --> Partial: Partial Payment
    Overdue --> Paid: Full Payment
    
    Paid --> [*]
    
    note right of Due
        Initial state when
        EMI record is created
    end note
    
    note right of Overdue
        Automatically set by
        daily cron job
    end note
```

---

## Monthly Rent Cycle

```mermaid
flowchart TD
    Start([1st of Month]) --> CronJob[Scheduled Job Runs<br/>generate_monthly_rent_charges]
    CronJob --> FetchCustomers[(Fetch All Customers<br/>WHERE payment_type = 'monthly_rent'<br/>AND status = 'active')]
    FetchCustomers --> Loop[For Each Customer]
    Loop --> CheckExists{Rent Already<br/>Generated for<br/>This Month?}
    CheckExists -->|Yes| Skip[Skip Customer]
    CheckExists -->|No| CheckProrate{First Month<br/>AND joined<br/>mid-month?}
    
    CheckProrate -->|Yes| CalcProrate[Calculate Pro-rated:<br/>daily_rate = monthly_rent / 30<br/>days_in_month = days from join to month end<br/>amount = daily_rate * days_in_month]
    CheckProrate -->|No| UseFullRent[amount = monthly_rent]
    
    CalcProrate --> SetDueDate
    UseFullRent --> SetDueDate
    
    SetDueDate[Set Due Date:<br/>5th of current month] --> InsertRent[(Insert monthly_rents:<br/>customer_id<br/>rent_month = 1st of month<br/>amount<br/>due_date = 5th<br/>status = 'due'<br/>remaining_amount = amount)]
    
    InsertRent --> UpdateCustomer[(Update Customer:<br/>next_due_date = 5th)]
    UpdateCustomer --> Skip
    Skip --> MoreCustomers{More<br/>Customers?}
    MoreCustomers -->|Yes| Loop
    MoreCustomers -->|No| Complete([Job Complete])
    
    Complete --> WaitDue[Wait Until 5th]
    WaitDue --> DueReached([5th of Month])
    DueReached --> NotifyPartner[Notify Partner<br/>of Due Rent]
    NotifyPartner --> WaitPayment{Payment<br/>Received?}
    
    WaitPayment -->|Yes| ProcessPayment[Process Payment]
    ProcessPayment --> UpdateRent[(Update Rent:<br/>paid_amount<br/>remaining_amount<br/>status)]
    UpdateRent --> NextMonth([Wait for Next Month])
    NextMonth --> Start
    
    WaitPayment -->|No| CheckOverdue{Past<br/>Due Date?}
    CheckOverdue -->|No| WaitPayment
    CheckOverdue -->|Yes| MarkOverdue[(Update Status<br/>= 'overdue')]
    MarkOverdue --> WaitPayment
```

### Monthly Rent Status Flow

```mermaid
stateDiagram-v2
    [*] --> Due: Rent Generated<br/>(1st of month)
    
    Due --> Partial: Partial Payment
    Due --> Paid: Full Payment
    Due --> Overdue: Due Date Passed<br/>(after 5th)
    
    Partial --> Paid: Remaining Paid
    Partial --> Overdue: Due Date Passed
    
    Overdue --> Partial: Partial Payment
    Overdue --> Paid: Full Payment
    
    Paid --> [*]: Month Complete
    
    note right of Due
        Rent becomes due
        on 5th of month
    end note
    
    note right of Overdue
        Automatically marked
        by daily job
    end note
```

---

## Overdue Management Flow

```mermaid
flowchart TD
    Start([Daily at Midnight]) --> CronJob[update_overdue_status<br/>Function Runs]
    CronJob --> FetchEMI[(SELECT * FROM emis<br/>WHERE due_date < TODAY<br/>AND status IN 'due', 'partial')]
    FetchEMI --> FetchRent[(SELECT * FROM monthly_rents<br/>WHERE due_date < TODAY<br/>AND status IN 'due', 'partial')]
    
    FetchRent --> ProcessEMI[Process Each EMI]
    ProcessEMI --> LoopEMI{For Each<br/>Overdue EMI}
    LoopEMI --> UpdateEMI[(UPDATE emis<br/>SET status = 'overdue'<br/>SET updated_at = now<br/>WHERE id = emi.id)]
    UpdateEMI --> MoreEMI{More EMIs?}
    MoreEMI -->|Yes| LoopEMI
    MoreEMI -->|No| ProcessRent
    
    ProcessRent[Process Each Rent] --> LoopRent{For Each<br/>Overdue Rent}
    LoopRent --> UpdateRent[(UPDATE monthly_rents<br/>SET status = 'overdue'<br/>SET updated_at = now<br/>WHERE id = rent.id)]
    UpdateRent --> MoreRent{More Rents?}
    MoreRent -->|Yes| LoopRent
    MoreRent -->|No| LogResults
    
    LogResults[Log Update Counts] --> Complete([Job Complete])
    
    Complete --> WaitNextDay[Wait 24 Hours]
    WaitNextDay --> Start
```

### Overdue Detection Logic

```mermaid
flowchart TD
    Record([EMI or Rent Record]) --> CheckStatus{Current<br/>Status?}
    CheckStatus -->|paid| Skip[Skip - Already Paid]
    CheckStatus -->|due or partial| CheckDate{Due Date<br/>< Today?}
    CheckDate -->|No| Skip
    CheckDate -->|Yes| CheckRemaining{Remaining<br/>Amount > 0?}
    CheckRemaining -->|No| Skip
    CheckRemaining -->|Yes| MarkOverdue[Mark as 'overdue']
    MarkOverdue --> CalcDays[Calculate<br/>days_overdue]
    CalcDays --> Notify[Notify Partner]
    Notify --> End([Overdue Marked])
    Skip --> End
```

---

## Credit System Flow

```mermaid
flowchart TD
    Start([Payment Received]) --> ProcessDist[Process Payment<br/>Distribution]
    ProcessDist --> PayEMI[Allocate to EMIs]
    PayEMI --> PayRent[Allocate to Rents]
    PayRent --> CheckExcess{Excess Amount<br/>Remaining?}
    
    CheckExcess -->|No| NoCredit[No Credit Change]
    CheckExcess -->|Yes| FetchCredit[(Fetch customer_credits<br/>WHERE customer_id)]
    
    FetchCredit --> CalcNew[new_balance =<br/>existing_balance + excess]
    CalcNew --> UpdateCredit[(UPDATE customer_credits<br/>SET credit_balance<br/>SET updated_at)]
    
    UpdateCredit --> RecordTrans[(INSERT transaction:<br/>type = 'deposit'<br/>credit_added = excess<br/>remarks = 'Credit from overpayment')]
    
    RecordTrans --> Notify[Notify Partner:<br/>'Credit Added']
    Notify --> End([Credit Updated])
    NoCredit --> End
```

### Credit Usage Flow

```mermaid
flowchart TD
    Start([New Payment Due]) --> CheckCredit{Customer Has<br/>Credit Balance?}
    CheckCredit -->|No| NormalPayment[Process Normal<br/>Payment Flow]
    CheckCredit -->|Yes| AskUse{Partner Chooses<br/>to Use Credit?}
    
    AskUse -->|No| NormalPayment
    AskUse -->|Yes| FetchBalance[(Get credit_balance)]
    FetchBalance --> CalcUse[Calculate:<br/>credit_to_use = min(balance, due_amount)]
    CalcUse --> ApplyCredit[Apply Credit<br/>to Payment]
    ApplyCredit --> UpdateBalance[(UPDATE credit_balance:<br/>balance - credit_used)]
    UpdateBalance --> RecordUsage[(INSERT transaction:<br/>type = 'credit_used'<br/>credit_used = amount)]
    RecordUsage --> CheckRemaining{Remaining<br/>Amount Due?}
    CheckRemaining -->|Yes| CollectCash[Collect Remaining<br/>in Cash]
    CheckRemaining -->|No| Complete
    CollectCash --> Complete[Payment Complete]
    NormalPayment --> Complete
    Complete --> End([Payment Processed])
```

### Credit Balance Tracking

```mermaid
stateDiagram-v2
    [*] --> Zero: Customer Created
    
    Zero --> Positive: Overpayment<br/>Received
    
    Positive --> Higher: More Overpayment
    Positive --> Lower: Credit Used<br/>for Payment
    Positive --> Zero: Credit Fully<br/>Used
    
    Higher --> Lower: Credit Used
    Higher --> Zero: Large Payment<br/>Made
    
    Lower --> Higher: New Overpayment
    Lower --> Zero: Credit Used Up
    
    Zero --> Positive: New Overpayment
    
    note right of Positive
        Credit can be used
        to pay future dues
    end note
    
    note left of Zero
        No credit available
        Normal payments only
    end note
```

---

## Data Access Flow (RLS)

### Row Level Security Policy Evaluation

```mermaid
flowchart TD
    Request([User Makes<br/>Database Request]) --> Auth{User<br/>Authenticated?}
    Auth -->|No| Reject[403 Forbidden]
    Auth -->|Yes| GetUID[Extract auth.uid]
    GetUID --> CheckPolicy{Which<br/>Operation?}
    
    CheckPolicy -->|SELECT| SelectPolicy[Check SELECT Policy]
    CheckPolicy -->|INSERT| InsertPolicy[Check INSERT Policy]
    CheckPolicy -->|UPDATE| UpdatePolicy[Check UPDATE Policy]
    CheckPolicy -->|DELETE| DeletePolicy[Check DELETE Policy]
    
    SelectPolicy --> EvalSelect{Evaluate<br/>USING Clause}
    InsertPolicy --> EvalInsert{Evaluate<br/>WITH CHECK}
    UpdatePolicy --> EvalUpdate{Evaluate<br/>USING + CHECK}
    DeletePolicy --> EvalDelete{Evaluate<br/>USING Clause}
    
    EvalSelect --> CheckRole1{is_admin OR<br/>is_own_data?}
    EvalInsert --> CheckRole2{is_admin OR<br/>is_own_data?}
    EvalUpdate --> CheckRole3{is_admin OR<br/>is_own_data?}
    EvalDelete --> CheckRole4{is_admin OR<br/>is_own_data?}
    
    CheckRole1 -->|Yes| AllowSelect[Return Data]
    CheckRole1 -->|No| FilterSelect[Filter Results]
    CheckRole2 -->|Yes| AllowInsert[Allow Insert]
    CheckRole2 -->|No| Reject
    CheckRole3 -->|Yes| AllowUpdate[Allow Update]
    CheckRole3 -->|No| Reject
    CheckRole4 -->|Yes| AllowDelete[Allow Delete]
    CheckRole4 -->|No| Reject
    
    AllowSelect --> Success
    FilterSelect --> Success
    AllowInsert --> Success
    AllowUpdate --> Success
    AllowDelete --> Success
    Success([Operation Successful])
    Reject --> End([Operation Denied])
    Success --> End
```

### Security Definer Function Flow

```mermaid
sequenceDiagram
    participant User
    participant RLS as RLS Policy
    participant Func as Security Definer<br/>Function
    participant Table as user_roles Table
    participant Result

    User->>RLS: Request access to data
    RLS->>Func: Call has_role(user_id, 'admin')
    Note over Func: Function executes with<br/>SECURITY DEFINER privileges
    Func->>Table: Query user_roles directly<br/>(bypasses RLS)
    Table-->>Func: Return role data
    Func->>Func: Check if user has role
    Func-->>RLS: Return boolean result
    
    alt User Has Role
        RLS-->>User: Grant access
        RLS->>Result: Return requested data
        Result-->>User: Data returned
    else User Doesn't Have Role
        RLS-->>User: Deny access
    end
```

### Partner Data Isolation

```mermaid
flowchart TD
    Partner([Partner Logs In]) --> GetID[Get partner_id<br/>from auth context]
    GetID --> QueryBatteries[(Query Batteries Table)]
    QueryBatteries --> RLS1{RLS Policy:<br/>partner_id = auth.uid<br/>OR is_admin?}
    RLS1 -->|True| FilterBatteries[Return Only<br/>Partner's Batteries]
    RLS1 -->|False| Empty1[Return Empty Set]
    
    FilterBatteries --> QueryCustomers
    Empty1 --> QueryCustomers
    
    QueryCustomers[(Query Customers Table)] --> RLS2{RLS Policy:<br/>partner_id = auth.uid<br/>OR is_admin?}
    RLS2 -->|True| FilterCustomers[Return Only<br/>Partner's Customers]
    RLS2 -->|False| Empty2[Return Empty Set]
    
    FilterCustomers --> Display
    Empty2 --> Display
    Display[Display Dashboard<br/>with Filtered Data] --> End([Partner Sees<br/>Only Own Data])
```

### Admin Access Flow

```mermaid
flowchart TD
    Admin([Admin Logs In]) --> CheckRole{Verify<br/>is_admin()}
    CheckRole -->|True| FullAccess[Grant Full Access]
    CheckRole -->|False| PartnerAccess[Fallback to<br/>Partner Permissions]
    
    FullAccess --> QueryAll[(Query Any Table)]
    QueryAll --> RLS{RLS Policy:<br/>is_admin?}
    RLS -->|True| Bypass[Bypass Partner<br/>Restrictions]
    Bypass --> ReturnAll[Return All Data<br/>From All Partners]
    ReturnAll --> Display[Display Complete<br/>System View]
    Display --> End([Admin Sees<br/>Everything])
    
    PartnerAccess --> End
```

---

## Complete System Flow

```mermaid
flowchart TD
    Start([System Start]) --> Auth[User Authentication]
    Auth --> Dashboard{User Role?}
    Dashboard -->|Admin| AdminFlow
    Dashboard -->|Partner| PartnerFlow
    
    AdminFlow[Admin Dashboard] --> AdminActions{Admin Action}
    AdminActions -->|Manage Partners| PartnerCRUD
    AdminActions -->|View All Data| AllData
    AdminActions -->|Run Reports| Reports
    AdminActions -->|Manage Scheduler| Scheduler
    
    PartnerFlow[Partner Dashboard] --> PartnerActions{Partner Action}
    PartnerActions -->|Manage Batteries| BatteryCRUD
    PartnerActions -->|Manage Customers| CustomerCRUD
    PartnerActions -->|Process Payments| PaymentFlow
    PartnerActions -->|View Billing| BillingDash
    
    PartnerCRUD[Create/Edit/Delete<br/>Partners] --> AdminFlow
    AllData[View All Partners<br/>Batteries, Customers] --> AdminFlow
    Reports[Generate System<br/>Reports] --> AdminFlow
    Scheduler[Configure Automated<br/>Jobs] --> AdminFlow
    
    BatteryCRUD[Add/Edit/Assign<br/>Batteries] --> PartnerFlow
    CustomerCRUD[Add/Edit<br/>Customers] --> PartnerFlow
    PaymentFlow[Process Customer<br/>Payments] --> PartnerFlow
    BillingDash[View Customer<br/>Billing] --> PartnerFlow
    
    AdminFlow --> BackgroundJobs
    PartnerFlow --> BackgroundJobs
    
    BackgroundJobs[Automated Jobs] --> DailyJobs{Daily Jobs}
    DailyJobs --> UpdateOverdue[Update Overdue<br/>Status]
    
    BackgroundJobs --> MonthlyJobs{Monthly Jobs}
    MonthlyJobs --> GenerateRent[Generate Monthly<br/>Rent Charges]
    
    UpdateOverdue --> BackgroundJobs
    GenerateRent --> BackgroundJobs
    
    BackgroundJobs --> End([System Running])
```

---

This comprehensive set of diagrams illustrates all major workflows in the Battery Beacon Connect system. Each diagram can be rendered using Mermaid in documentation tools or IDEs that support Mermaid syntax.
