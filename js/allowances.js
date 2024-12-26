// Global Constants
// these constants are used for the Timesheet Entry record types
const workOrderRelated = '0120O000000ksqIQAQ'
const nonWorkOrderRelated = '0120O000000ksqHQAQ'
// globals

var userInfo
var userId
var labourCurrencyVal
//var userCountryCode
//var userCountry
var newParentTSEs = [];
var userTimezone
var userLanguage
var timesheetEntriesData
var timesheetsData
var defaultWoli
var defaultWoliId
var workOrderId
var workOrderLineItemId
var workOrderLineItemName
var launchViewContext // used to store which view to return to after an action completes
var typingTimer // used for timing between key strokes for seacrh entry
var doneTypingInterval = 1000 // time in ms after stopped typing before perform action
var hasSdOrder
var userLocale
var workOrderStatus
var saAppointmentNumber
var saSubject
var totalSatusSelected = false
var selectedStatus
var activityTypeVar
var WorkOrderLineItemIdTSE
var WorkOrderIdTSE
var unproductiveCodeTSE
var unproductiveCodeNameTSE
var rejectedToNew = false
var userBusiness
var userBusinessLine
var userBUID
var userBU
var userDivision
var userProductGroup
var setFeatureFlag = false; //Added By Smith
// Global params for pick lists, lookups & checkboxes
// var WorkOrderLineItem; // Lookup
var lookupData = {}
var userSAPList = []
var varWageOrAbsence = 'FALSE';
// test 1
// get url params for when launched from record
var objectId
var saId
var objectType
var sapSubProcessType
var woProjectActivity
var selectedTimePicker
var selectedLookUp;
var selectedPickUp;
var inlineTsEntry = false
var tsElement = ".timesheet-entry.active"
var tsEntrywoid = ""
var tsEntrywoliid = ""
var tsEntrysaid = ""
var dayInlineTSClick = false
var selectedDayTs
var showOtherOrderType = false

$(document).ready(function () {
    initialiseBridge()
//US104505
    if (objectType == 'ServiceAppointment') {
        saId = getQueryVariable('id')
        objectId = getQueryVariable('parentId')
        objectType = getQueryVariable('parentType')
    } else if (objectType == 'WorkOrder') {
        saId = getQueryVariable('serviceAppointmentId')
        objectId = getQueryVariable('objectId')
        objectType = getQueryVariable('objectType')
        workOrderId = objectId
    } else if (objectType == 'WorkOrderLineItem') {        
        objectId = getQueryVariable('objectId')
        if (objectId == undefined || objectId == "") {
            objectId = getQueryVariable('id')
        }
        objectType = getQueryVariable('objectType')
        workOrderLineItemId = objectId
        saId = sessionStorage.getItem("csrServiceAppointmentId")
    }
    checkLaunchContext();
	
    $(parent.window).resize(function () { // resize iFrame on parent window resize.
        setIframeSize()
    })
    // check orientation for android device
    window.onorientationchange = function () {
        setIframeSize()
    }

    $('head', window.parent.document).append($('<style type="text/css">  * { box-sizing: border-box;!important}  </style>'))
    // hide pulsar FSL headers and footers
    pulsar.hideNavBar()
    // set body heights and widths for iOS devices
    setIframeSize()
    var attr = $('#focus-overlay').attr('style')
    if (typeof attr !== typeof undefined && attr !== false) {
        $('#overlay').addClass('active')
    } else {
        $('#overlay').removeClass('active')
    }

    $('.focus-button').click(function () {
        $('#overlay').removeClass('active')
    })

    $('#overlay').click(function () {
        $('#focus-overlay').css('display', 'none')
    })
    $('.add-inline-btn').click(function (e) {
        e.preventDefault(); 
        var startTime
        var endTime
        subject = $(this).parents('div.trow').find('.timesheet-entry-subject input').val();
        rejectReason = $(this).parents('div.trow').find('.timesheet-entry-reject-reason input').val();
        startTime = $(this).parents('div.trow').find('.timesheet-entry-start-time input').val();
        endTime = $(this).parents('div.trow').find('.timesheet-entry-end-time input').val();
        var tsEntryRow = $(this).parents('div.trow').clone(true,true);        
        tsEntryRow.addClass('taddedrow')       
        $(".inline-timesheet-entry-table").find("div.trow:last").before(tsEntryRow); 
        $(".inline-timesheet-entry-table").find('div.tbody.trow .delete-ts-entry').show()
        $(".inline-timesheet-entry-table").find('div.tbody.trow .add-inline-btn').hide()
        $(this).show();       
        $(this).parents('div.trow').prev().find('.timesheet-entry-start-time input').attr('disabled',true);
        $(this).parents('div.trow').prev().find('.timesheet-entry-end-time input').attr('disabled',true);
        $(this).parents('div.trow').prev().find('.timesheet-entry-duration input').attr('disabled',true);        
        $(this).parents('div.trow').prev().removeClass('active')
        let inlineDate = $(this).parents('div.trow').prev().find("input[name='entry-date']").attr('value')
       $('.trow.timesheet-entry.taddedrow').find('.timesheet-entry-FSLABB_OtherOrderType__c .delete-text').css({'pointer-events': 'none'})
       $('.trow.timesheet-entry.taddedrow').find('.timesheet-entry-FSLABB_SAPId__c input').css({'pointer-events': 'none'})
        $(this).parents('div.trow').prev().attr({ 
            'data-start-time':moment.tz(`${inlineDate}T${startTime}`,userTimezone).format(),
            'data-end-time': moment.tz(`${inlineDate}T${endTime}`,userTimezone).format(),
            'data-sfid': ""
        })
        //Reset current row
        $(this).parents('div.trow').removeClass('taddedrow').addClass('active')
        $(this).parents('div.trow').find('input, textarea').not("input[name='entry-date']").val('');
        $(this).parents('div.trow').find('.timesheet-entry-start-time input').attr('disabled',false);
        $(this).parents('div.trow').find('.timesheet-entry-end-time input').attr('disabled',false);
        $(this).parents('div.trow').find('.timesheet-entry-duration input').attr('disabled',false);
        $(this).parents('div.trow').find('.timesheet-entry-FSLABB_OtherOrderType__c input').attr('disabled',false);
        $(".inline-timesheet-entry-table").find("div.trow:last  :input.picklist").attr('data-id', "")
        $(".inline-timesheet-entry-table").find("div.trow:last :input.lookup").attr('data-id', "")
        $('div.trow:last .value', '.inline-timesheet-entry-table').each(function () {
            $(this).text('')
            if($(this).attr('data-id')){
                $(this).attr('data-id',"")
            }
        })
        $(this).parents('div.trow').attr({ 
            'data-start-time':"",
            'data-end-time': "",
            'data-sfid': ""
        })  
        //resetInlineFields()
        $('.inline-form-container button.next').attr('disabled', true)
        if($(".inline-timesheet-entry-table").find("div.trow.tbody").length > 1){
            $('.inline-form-container button.inline-save-btn').attr('disabled', false)
        }
        addTimeSheetLineEntry('timesheet','',inlineDate)
    })
    $("body").on("click", ".delete-ts-entry", function(e){
        var currentRow = $(this)
        showDiscardInlineTspopup('deleteRow', currentRow)
    });
$("body").on("click", ".action-day-clone", function (e) {
        e.stopPropagation()
        let currentRow = $(this)
        let activeCloneDate = $(currentRow).parents('.timesheet').find(".day.active").attr("data-date")
        openCloneTimesheetPopup(activeCloneDate)
    })
    $(".timesheet-entry-FSLABB_Allowance_Amount__c .number").inputFilter(function(value) {
        return /^\d+(\.\d{0,2})?$/.test(value)
    })
    buildDom()
})

function displayCorrectFields(userCountry) {

    for (const [fieldName, recordType] of Object.entries(country[userCountry].fields)) { // loop through fields
        //			fieldName=fieldName.replace('_ref__c',''); //strip '_ref__c' of the end of lookups
        const fieldContainer = $(`.timesheet-entry-${fieldName}`)
        const fieldInput = $('input', fieldContainer)
        if (recordType['Non-Work Order Related'] === 'FALSE') {
            fieldContainer.addClass('not-on-non-work-order')
            $("div[data-dependentKey='" + fieldName + "']").addClass('not-on-non-work-order')
        } else if (recordType['Non-Work Order Related'] === 'Mandatory') {
            fieldInput.addClass('required-on-non-work-order-related')
        }
        if (recordType['Work Order Related'] === 'FALSE') {
            fieldContainer.addClass('not-on-work-order')
            $("div[data-dependentKey='" + fieldName + "']").addClass('not-on-work-order')
        } else if (recordType['Work Order Related'] === 'Mandatory') {
            fieldInput.addClass('required-on-work-order-related')
        }
    }
}

function buildDom() {
    // get current user first as we need to use the id for limiting results for further data calls to records relevant to the user
    callJSAPI('userInfo', {}, null)
        .then( // check Launch Context, get Timesheets Data, get Timesheet Entries Data
            function (results) {
                userInfo = results
                userLocale = userInfo.locale.replace('_', '-')
                userId = results.userid
                var userData = callJSAPI('read', { 'Id': userId }, 'User')
                var timesheetsData = callJSAPI('select', {
                    'query': `SELECT Id, TimeSheetNumber, StartDate, EndDate, LastModifiedDate
                              FROM TimeSheet
                              WHERE FSLABB_ServiceResourceUser_ref__c = '${userId}' AND IsDeleted !='Deleted' ORDER BY StartDate ASC`
                }, 'TimeSheet')
                var data = {
                    'query': `SELECT TSE.Id AS Id,
                                TSE.Description AS Description,
                                TSE.DurationInMinutes AS DurationInMinutes,
                                TSE.EndTime AS EndTime,
                                TSE.TimeSheetEntryNumber AS TimeSheetEntryNumber,
                                TSE.FSLABB_ServiceAppointment_ref__c AS FSLABB_ServiceAppointment_ref__c,
                                TSE.FSLABB_ServiceAppointment_Name__c AS FSLABB_ServiceAppointment_Name__c,
                                TSE.FSLABB_Absence_Type_ref__c AS FSLABB_Absence_Type_ref__c ,
                                TSE.FSLABB_Absence_Type_Name__c AS FSLABB_Absence_Type_Name__c ,
                                TSE.FSLABB_ActivityType__c AS FSLABB_ActivityType_ref__c,
                                TSE.FSLABB_ActivityType_Name__c AS FSLABB_ActivityType_Name__c,
                                TSE.FSLABB_Allowance_Amount__c AS FSLABB_Allowance_Amount__c,
                                TSE.FSLABB_Allowance_Amount_Currency__c AS FSLABB_Allowance_Amount_Currency__c,
                                TSE.FSLABB_Allowance_Amount_Currency_Name__c AS FSLABB_Allowance_Amount_Currency_Name__c,
                                TSE.FSLABB_Allowance_Type_ref__c AS FSLABB_Allowance_Type_ref__c,
                                TSE.FSLABB_Allowance_Type_Name__c AS FSLABB_Allowance_Type_Name__c,
                                TSE.FSLABB_Bank_Time__c AS FSLABB_Bank_Time__c,
                                TSE.FSLABB_Category_ref__c AS FSLABB_Category_ref__c,
                                TSE.FSLABB_Category_Name__c AS FSLABB_Category_Name__c,
                                TSE.FSLABB_CostCenter__c AS FSLABB_CostCenter__c,
                                TSE.FSLABB_IsNonWorkRelated__c AS FSLABB_IsNonWorkRelated__c,
                                TSE.FSLABB_OtherOrderType__c AS FSLABB_OtherOrderType__c,
                                TSE.FSLABB_OtherOrderType_Name__c AS FSLABB_OtherOrderType_Name__c,
                                TSE.FSLABB_OvertimeCompensationAllowance__c AS FSLABB_OvertimeCompensationAllowance__c,
                                TSE.FSLABB_OvertimeCompensationAllowance_Nam__c AS FSLABB_OvertimeCompensationAllowance_Name__c,
                                TSE.FSLABB_Reject_Reason__c AS FSLABB_Reject_Reason__c,
                                TSE.FSLABB_TimeEntryType__c AS FSLABB_TimeEntryType__c,
                                TSE.FSLABB_Country__c AS FSLABB_Country__c,
                                TSE.FSLABB_TimeEntryType_Name__c AS FSLABB_TimeEntryType_Name__c,
                                TSE.FSLABB_UnproductiveCode__c AS FSLABB_UnproductiveCode__c,
                                TSE.FSLABB_UnproductiveCode_Name__c AS FSLABB_UnproductiveCode_Name__c,
                                TSE.FSLABB_Wage_Type_ref__c AS FSLABB_Wage_Type_ref__c,
                                TSE.FSLABB_Wage_Type_Name__c AS FSLABB_Wage_Type_Name__c,
                                TSE.FSLABB_SD_Sales_Order_Line_Item__c AS FSLABB_SD_Sales_Order_Line_Item__c,
                                TSE.FSLABB_SAPId__c AS FSLABB_SAPId__c,
                                TSE.FSLABB_SAPOperation__c AS FSLABB_SAPOperation__c,
                                TSE.StartTime AS StartTime,
                                TSE.Status AS Status,
                                TSE.Subject AS Subject,
                                TSE.TimeSheetId AS TimeSheetId,
                                TSE.WorkOrderId AS WorkOrderId,
                                TSE.WorkOrderLineItemId AS WorkOrderLineItemId,
                                TSE.LastModifiedDate AS LastModifiedDate,
                                TSE.FSLABB_Allowance__c,
                                WOLI.Subject AS WorkOrderLineItem_Name__c,
                                WO.WorkOrderNumber AS WorkOrderNumber,
                                AC.Name AS AccountName,
                                LO.Name AS SiteName
                            FROM TimeSheetEntry TSE 
                                Left Join WorkOrderLineItem WOLI ON WOLI.Id=TSE.WorkOrderLineItemId
                                Left Join WorkOrder WO on WO.Id=TSE.WorkOrderId
                                Left Join Account AC on AC.Id=WO.AccountId
                                Left Join Location LO on LO.Id=WO.FSLABB_Site__c
                            WHERE TSE.FSLABB_ServiceResourceUser_ref__c = '${userId}' AND TSE.IsDeleted != 'Deleted' and TSE.FSLABB_Allowance__c = 'TRUE'
                            ORDER BY StartTime ASC`
                }
                var timesheetEntriesData = callJSAPI('select', data, 'TimeSheetEntry')

                return Promise.all([ // need to ensure all are complete before building Timesheet Entries
                     [],
                    userData.then(
                        function (results) {
                            userCountryCode = results[0].CountryCode
                            userCountry = results[0].Country
                            userCurrency = results[0].CurrencyIsoCode
                            userTimezone = results[0].TimeZoneSidKey
                            moment.tz.setDefault(userTimezone)
                            userLanguage = results[0].LanguageLocaleKey.replace('_', '-')
                            userProductGroup = results[0].Product_Group_PG__c
                            // userBusinessLine = results[0].Business_Unit_BU__c
                            //userBusiness = results[0].Division_DIV__c
                            //userEmail = results[0].Email
                                                        userBusiness = results[0].Division_DIV__c
                            userBU = results[0].Business_Unit_BU__c
                            if (userBU) { userBUID = userBU.split(' - ')[0] } else { userBUID = null }
                            userBusinessLine = userBUID
                            if (userProductGroup) { userProductGroup = userProductGroup.split(' - ')[0] } else { userProductGroup = null }
                            displayCorrectFields(userCountry)
                            // For US-95266
                            decideDescriptionFieldVisibility('Description')
                            return buildPicklistsLookups()
                        }
                    ),
                    timesheetsData.then(
                        function (results) { // build Timesheets
                            if (results.length == 0) {
                                logToScreen(translateErrorMessage("FSLABB_Error_Message_7"), true)
                                throw ('No Timesheets available')
                            } else {
                                buildTimesheets(results)
                            }
                        }
                    ),
                    timesheetEntriesData
                ]).catch(function (error) {
                    logToScreen(error)
                    logToConsole(error)
                })
            }
        )
        .then(
            function (results) {
                // populate hour and minute options
                for (let hour = 0; hour <= 23; hour++) {
                    const option = `${hour}`.padStart(2, "0")
                    $('#time-picker-hours').append(`<option id="hour-${option}" value="${option}">${option}</option>`)
                }
                for (let minute = 0; minute <= 59; minute += country[userCountry].workPeriod) {
                    const option = `${minute}`.padStart(2, "0")
                    $('#time-picker-minutes').append(`<option id="hour-${option}" value="${option}">${option}</option>`)
                }
                // If launched from wo-related
                if (objectId) {
                    // Query for Service Appointment data
                    var saQueryData = {
                        'query': `SELECT AppointmentNumber, Subject 
                                FROM ServiceAppointment 
                                WHERE Id = '${saId}'`
                    }
                    var saData = callJSAPI('select', saQueryData, 'ServiceAppointment')
                    saData.then(
                        function (results) {
                            // Set SA variables
                            saAppointmentNumber = results[0].AppointmentNumber
                            saSubject = results[0].Subject
                            $('.value', '#dropdown-service-appointment').text(`${saAppointmentNumber} ${saSubject}`)
                        }
                    )
                }

                // Build TimesheetEntries
                var timeSheetEntriesDataArray = results[3]
                activityTypeVar = timeSheetEntriesDataArray
                buildTimesheetEntries(timeSheetEntriesDataArray)
                buildVersionData("allowancesversion")
            }
        )
        .then(
            function (results) {
                $('.timesheet').each(function () {
                    $('.day', $(this)).each(function () {
                        // if timesheet is work order related and work order status is closed
                        if ($('body').hasClass('work-order-related') && workOrderStatus == 'Closed') {
                            $(this).addClass('noWOEntryAllowed')
                        }
                    })
                    if (!($('.day:not(.noWOEntryAllowed)', $(this)).length > 0)) { $(this).addClass('noWOEntryAllowed') } // if no days where WO entry allowed then no WO entry allowed on TS
                })
                // Swap update timesheet totals after sort

                // Sort the timesheets properly
                sortTimesheetEntries(false)
                // Update the Days Totals
                updateTimesheetTotals(false)
                // Update the heights of bar charts, etc
                chartHeightsAndInitialize(false)
                // on window.resize call the scroll functions again
                // All the timeout code makes it so that it won't CONSTANTLY call scrollToToday() - only when the window isn't being resized anymore
                var rtime
                var timeout = false
                var delta = 200
                $(window).resize(function () {
                    rtime = new Date()
                    if (timeout === false) {
                        timeout = true
                        setTimeout(resizeend, delta)
                    }
                })

                function resizeend() {
                    if (new Date() - rtime < delta) {
                        setTimeout(resizeend, delta)
                    } else {
                        timeout = false
                        scrollToToday()
                    }
                }
                logToConsole('DOM build finished')
                // And show the Timesheets
                //$('body').removeClass('view-processing')
               // $('body').addClass('view-timesheets')
               changeBodyClass('view-processing', 'view-timesheets')
                // add on click event listener on days in timesheets view.  Click makes day clicked active and changes to view-day
                $('.view-timesheets .day-barchart').on('click', viewDay)

                if ($('body').hasClass('work-order-related') && workOrderStatus == 'Closed') {
                    $('body').addClass('workorder-closed')
                }
            }
        )
        .catch(
            function (error) {
                logToScreen(error)
                logToConsole(error)
            }
        )
}

function buildPicklistsLookups(temp = false) {


    var allowanceTypeQuery = `SELECT Id, Name, FSLABB_Country__c, FSLABB_Description__c,FSLABB_IsCurrency__c
   FROM FSLABB_Allowance_Type__c
   WHERE IsDeleted !='Deleted' AND FSLABB_Active__c = 'TRUE' AND Show_Allowance_on_TSE__c = 'FALSE'
   AND ((
   FSLABB_Country__c = '${userCountry}'
   AND FSLABB_Business__c= '${userBusiness}'
   AND FSLABB_BusinessLine__c = '${userBusinessLine}'
AND FSLABB_ProductGroup__c = '${userProductGroup}'
   ) OR (
   FSLABB_Country__c = '${userCountry}'
   AND FSLABB_Business__c= '${userBusiness}'
   AND FSLABB_BusinessLine__c = '${userBusinessLine}'
AND FSLABB_ProductGroup__c IS NULL
   ) OR (
   FSLABB_Country__c = '${userCountry}'
AND FSLABB_Business__c= '${userBusiness}'
   AND FSLABB_BusinessLine__c IS NULL
   AND FSLABB_ProductGroup__c IS NULL
   ) OR (
   FSLABB_Country__c = '${userCountry}'
AND FSLABB_Business__c IS NULL
   AND FSLABB_BusinessLine__c IS NULL
   AND FSLABB_ProductGroup__c IS NULL
   ) OR (
       FSLABB_Country__c IS NULL
       AND FSLABB_Business__c IS NULL
   AND FSLABB_BusinessLine__c IS NULL
   AND FSLABB_ProductGroup__c IS NULL
       )) AND `

    if ((objectType == '') || (objectType == null) || (objectType == undefined)) {

        allowanceTypeQuery += ` FSLABB_Applicable_For__c In ('Both','Non-Work Order only')`;
    } else {
        allowanceTypeQuery += ` FSLABB_Applicable_For__c In ('Both','Work Order only')`;
    }

    allowanceTypeQuery += ` Order BY Name ASC`

    var allowanceTypeData = callJSAPI('select', {
        'query': allowanceTypeQuery
    }, 'FSLABB_Allowance_Type__c')

    var salesOrderLineItemWOQuery = {
        'query': `SELECT Id,FSLABB_SAP_Description__c, Name FROM FSLABB_SD_Sales_Order_Line_Item__c WHERE FSLABB_Work_Order__c = '${workOrderId}'`
    }
    var salesOrderLineItemWOData = callJSAPI('select', salesOrderLineItemWOQuery, 'FSLABB_SD_Sales_Order_Line_Item__c')
    logToConsole('**salesOrderLineItemWOData 1 : ' + JSON.stringify(salesOrderLineItemWOData))

    // Get picklist data
    if (temp) {
        if ($('div.timesheet.active div.day.active div.timesheet-entry.active.rejected').hasClass('work-order-related')) { // If WO/WOLI related
            var data = { 'RecordTypeId': workOrderRelated }
        } else {
            var data = { 'RecordTypeId': nonWorkOrderRelated }
        }
    }
    else {
        if (objectId) { // If WO/WOLI related
            var data = { 'RecordTypeId': workOrderRelated }
        } else {
            var data = { 'RecordTypeId': nonWorkOrderRelated }
        }
    }

    var allowanceAmmountCurrencyData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_Allowance_Amount_Currency__c')

    var otherOrderTypeData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_OtherOrderType__c')

    var overtimeCompensationAllowanceData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_OvertimeCompensationAllowance__c')


    var unproductiveCodeData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_UnproductiveCode__c')

    var countryData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_Country__c')

    // Build lookups and picklists
    return Promise.all([

        allowanceTypeData.then(function (result) {
            lookupData.FSLABB_Allowance_Type = result
            createLookup('FSLABB_Allowance_Type', 'fromAllowance')
        }),

        salesOrderLineItemWOData.then(function(result) {
            logToConsole('**salesOrderLineItemWOData : ' + JSON.stringify(result))
            lookupData.FSLABB_SD_Sales_Order_Line_Item__c = result
            createLookupSalesOrder('FSLABB_SD_Sales_Order_Line_Item__c')
        }),

        // Build picklists
        allowanceAmmountCurrencyData.then(function (result) {
            // console.log(result.itemLabels);
            result.itemIds = _.orderBy(result.itemIds);
            result.itemLabels = result.itemIds
            picklistData.FSLABB_Allowance_Amount_Currency__c = result
            createPicklist('FSLABB_Allowance_Amount_Currency__c')
        }),

        otherOrderTypeData.then(function (result) {
            // Get index of Not Applicable option
            var naIndex = result.itemIds.indexOf('NA')

            // If Not Applicable option exists
            if (naIndex !== -1) {
                // Remove it from list of options
                result.itemIds.splice(naIndex, 1)
                result.itemLabels.splice(naIndex, 1)
            }

            picklistData.FSLABB_OtherOrderType__c = result
            createPicklist('FSLABB_OtherOrderType__c')
        }),

        overtimeCompensationAllowanceData.then(function (result) {
            picklistData.FSLABB_OvertimeCompensationAllowance__c = result
            createPicklist('FSLABB_OvertimeCompensationAllowance__c')
        }),



        unproductiveCodeData.then(function (result) {
            picklistData.FSLABB_UnproductiveCode__c = result
            createPicklist('FSLABB_UnproductiveCode__c')
        }),
        countryData.then(function (result) {
            picklistData.FSLABB_Country__c = result
            createPicklist('FSLABB_Country__c')
        })

    ]).catch(function (error) {
        logToScreen(error)
        logToConsole(error)
    })
}
function buildWOLILookUp() {
    // Get lookup data
    if (typeof workOrderIdTSE !== 'undefined') {
        var workOrderLineItemQuery = { 'query': "SELECT Id, LineItemNumber, Subject FROM WorkOrderLineItem WHERE workOrderId='" + workOrderIdTSE + "' ORDER BY LineItemNumber ASC" }
    }
    else {
        var workOrderLineItemQuery = { 'query': "SELECT Id, LineItemNumber, Subject FROM WorkOrderLineItem WHERE workOrderId='" + workOrderId + "' ORDER BY LineItemNumber ASC" }
    }
    var workOrderLineItemData = callJSAPI('select', workOrderLineItemQuery, 'WorkOrderLineItem')
    workOrderLineItemData.then(function (result) {
        lookupData.WorkOrderLineItem = result
        createLookupWOLI('WorkOrderLineItem')
    })
}

function buildWOLILookUpNew(newTSE) {
    // Get lookup data
    var workOrderLineItemQuery = { 'query': "SELECT Id, LineItemNumber, Subject FROM WorkOrderLineItem WHERE workOrderId='" + workOrderId + "' ORDER BY LineItemNumber ASC" }

    var workOrderLineItemData = callJSAPI('select', workOrderLineItemQuery, 'WorkOrderLineItem')
    workOrderLineItemData.then(function(result) {
        if ((objectType == '') || (objectType == null) || (objectType == undefined)) {
            populateDefaultFields(newTSE)
        } else {
            if ((launchContext.workOrderLineItemId).length > 0) {
                defaultWoli = workOrderLineItemName;
                defaultWoliId = launchContext.workOrderLineItemId;
                populateDefaultFields(newTSE)
            } else {
        defaultWoli = result[0].Subject
        defaultWoliId = result[0].Id
        populateDefaultFields(newTSE)
            }
        }
        lookupData.WorkOrderLineItem = result
        createLookupWOLI('WorkOrderLineItem')
    }).catch(function(error) {
        logToScreen(error)
        logToConsole(error)
    })
}

function buildSDLineItemLookup(newTSE, flag=true) {
    // Get lookup data
    return new Promise((resolve, reject) => {
    var requestObject = ''
    var getSDLineItemQuery = ''
    if(flag){
        getSDLineItemQuery = {
        'query': `Select SA.SD_Sales_Order_Line_Item__c, SD.Id,  SD.FSLABB_SAP_Description__c, SD.Name FROM ServiceAppointment as SA LEFT JOIN FSLABB_SD_Sales_Order_Line_Item__c as SD on SA.SD_Sales_Order_Line_Item__c = SD.Id WHERE SA.Id = '${saId}'`
    }
        requestObject = 'ServiceAppointment'
    }else{
        getSDLineItemQuery = {
            'query': `Select TE.FSLABB_SD_Sales_Order_Line_Item__c, SD.Id, SD.FSLABB_SAP_Description__c, SD.Name FROM TimeSheetEntry as TE LEFT JOIN FSLABB_SD_Sales_Order_Line_Item__c as SD on TE.FSLABB_SD_Sales_Order_Line_Item__c = SD.Id WHERE TE.Id = '${newTSE.attr('data-sfid')}'`
        }
        requestObject = 'TimeSheetEntry'
    }
    var salesOrderLineItemWOQuery = {
        'query': `SELECT Id,FSLABB_SAP_Description__c, Name, FSLABB_Status__c FROM FSLABB_SD_Sales_Order_Line_Item__c WHERE FSLABB_Status__c != 'Closed' AND FSLABB_Work_Order__c = '${workOrderId}'`
    }
    callJSAPI('select', salesOrderLineItemWOQuery, 'FSLABB_SD_Sales_Order_Line_Item__c').then(function(resultWO) {
       
        lookupData.FSLABB_SD_Sales_Order_Line_Item__c = resultWO
        createLookupSalesOrder('FSLABB_SD_Sales_Order_Line_Item__c')

        callJSAPI('select', getSDLineItemQuery, requestObject).then(function(result) {
        logToConsole('**salesOrderLineItemData result : '+JSON.stringify(result) +'::'+result.length)
            if (result.length == 1 && result[0].Id != '') {
                $('div.timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c input', newTSE).val(result[0].FSLABB_SAP_Description__c)
                $('div.timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c div.value', newTSE).text(result[0].FSLABB_SAP_Description__c)
                $('div.timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c input', newTSE).attr('data-id', result[0].Id)
            }else{
                $('div.timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c input', newTSE).val('')
                $('div.timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c div.value', newTSE).text('')
                $('div.timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c input', newTSE).attr('data-id','')
            }
            resolve(result)
            }).catch((err) => {
                reject(err.message)
            })
        //resolve(true)
        }).catch((err) => {
            reject(err.message)
        })
    }).catch(function(error) {
        reject(error.message)
    })
}

function populateDefaultFields(newTSE){
    $('div.timesheet-entry-WorkOrderLineItemId input', newTSE).val(defaultWoli)
    $('div.timesheet-entry-WorkOrderLineItemId div.value', newTSE).text(defaultWoli)
    $('div.timesheet-entry-WorkOrderLineItemId input', newTSE).attr('data-id', defaultWoliId)

    // $('div.timesheet-entry-FSLABB_TimeEntryType__c input', newTSE).val('Labour')
    // $('div.timesheet-entry-FSLABB_TimeEntryType__c div.value', newTSE).text('Labour')
    // $('div.timesheet-entry-FSLABB_TimeEntryType__c input', newTSE).attr('data-id', 'Labour')

    $('div.timesheet-entry-subject input', newTSE).val('-')
    $('div.timesheet-entry-subject div.value', newTSE).text('-')
}

function createSearchable() {
    var searchableResult = ''
    for (let i = 0; i <= arguments.length; i++) {
        if (arguments[i]) {
            searchableResult = searchableResult + arguments[i].replace(/\s+/g, '')
        };
    }
    return new Option(searchableResult).innerHTML.toLowerCase()
}

function checkLaunchContext() {
    logToConsole('Checking context')
    return new Promise(function (resolve, reject) {
        logToConsole('objectType:' + objectType)
        logToConsole('objectId:' + objectId)
        logToConsole('saId: ' + saId)
        var dayRelatedLabel = $('#domtemplates div.day-header-split-totals div.day-header-total-hours-related div.label')
        var daysRelatedLabel = $('#domtemplates div.days-header-split-totals div.days-header-total-hours-related div.label')
        var dayNonRelatedLabel = $('#domtemplates div.day-header-split-totals div.day-header-total-hours-non-related div.label')
        var daysNonRelatedLabel = $('#domtemplates div.days-header-split-totals div.days-header-total-hours-non-related div.label')
        if (objectType == 'WorkOrder') {
            workOrderId = objectId // set workOrderId = objectId
            $(dayRelatedLabel).text('WO Allowance')
            $(daysRelatedLabel).text('WO Allowance')
            $(dayNonRelatedLabel).text('Non-WO Allowance')
            $(daysNonRelatedLabel).text('Non-WO Allowance')
            $('body').addClass('work-order') // add class 'work-order' to body
            var workOrderRecord = callJSAPI('read', { 'Id': workOrderId }, 'WorkOrder')
            workOrderRecord.then(function (results) {
                logToConsole('WO Response:' + JSON.stringify(results))
                $('.value', '#dropdown-work-order').text(`${results[0].WorkOrderNumber} ${results[0].Subject}`)// Populate #dropdown-work-order > .value with Subject
                workOrderStatus = results[0].Status
                var sapOrderType = results[0].FSLABB_SAP_Document_Type__c
                hasSdOrder = sapOrderType.includes('SD_ORDER')
                sapSubProcessType = results[0].FSLABB_SAPSubProcessType__c
                woProjectActivity = results[0].FSLABB_ProjectActivity__c
                buildWOLILookUp()
                resolve()
            })
        } else if (objectType == 'WorkOrderLineItem') {
            $('body').addClass('work-order-line-item')
            launchContext.workOrderLineItemId = objectId // set workOrderLineItemId = objectId
            $(dayRelatedLabel).text('WOLI Allowances')
            $(daysRelatedLabel).text('WOLI Allowances')
            $(dayNonRelatedLabel).text('Other Allowances')
            $(daysNonRelatedLabel).text('Other Allowances')
            workOrderLineItemRecord = callJSAPI('read', { 'Id': launchContext.workOrderLineItemId }, 'WorkOrderLineItem')
            workOrderLineItemRecord.then(function (results) {
                workOrderLineItemName = results[0].Subject
                workOrderId = results[0].WorkOrderId
                // $('.value', '#dropdown-work-order-line-item').text(workOrderLineItemName) // Populate dropdown-work-order-line-item > .value with LineItemNumber
                $('.value', '#dropdown-work-order-line-item').text(`${results[0].LineItemNumber} ${workOrderLineItemName}`)// Populate #dropdown-work-order > .value with Subject

                var workOrderRecord = callJSAPI('read', { 'Id': workOrderId }, 'WorkOrder')
                workOrderRecord.then(
                    function (results) {
                        logToConsole('Response:' + JSON.stringify(results))
                        $('.value', '#dropdown-work-order').text(`${results[0].WorkOrderNumber} ${results[0].Subject}`)// Populate #dropdown-work-order > .value with Subject
                        // $('.value', '#dropdown-work-order').text(results[0].Subject) // Populate #dropdown-work-order > .value with Subject
                        workOrderStatus = results[0].Status
                        var sapOrderType = results[0].FSLABB_SAP_Document_Type__c
                        hasSdOrder = sapOrderType.includes('SD_ORDER')
                        sapSubProcessType = results[0].FSLABB_SAPSubProcessType__c
                        woProjectActivity = results[0].FSLABB_ProjectActivity__c
                        resolve()
                        buildWOLILookUp()
                    }
                )
            })
        } else {
            // remove class 'work-order-related' to body
            // add class 'non-work-order-related' to body
            $(dayRelatedLabel).text('Non Work Allowances')
            $(daysRelatedLabel).text('Non Work Allowances')
            $(dayNonRelatedLabel).text('Work Allowances')
            $(daysNonRelatedLabel).text('Work Allowances')
            //  $('body').removeClass('work-order-related').addClass('non-work-order-related')
            changeBodyClass('work-order-related', 'non-work-order-related')
            resolve()
        }

    }).catch(function (error) {
        logToScreen(error)
        logToConsole(error)
    })
}

function buildTimesheets(timesheets) {
    if (timesheets.length) {
        // add Timesheets in to dataModel var for later use and ease of agregating functions?
        logToConsole('Building Allowances')
        return Promise.all(
            timesheets.map((timesheet, index) => buildTimesheet(timesheet, index, timesheets.length))
        ).catch(function (error) {
            logToScreen(error)
            logToConsole(error)
        })
    } else {
        // If there are no timesheets for user than display message
        logToConsole('No Allowances')
        $('#no-timesheets').show()
    }
}

function buildTimesheet(timesheet, i, length) {
    return new Promise(function () {
        var sdVars = timesheet.StartDate.split('-') // Gets ,yyyy, mm, dd]
        var edVars = timesheet.EndDate.split('-') // Gets ,yyyy, mm, dd]
        var timesheetStartDate = new Date(sdVars[0], sdVars[1] - 1, sdVars[2]) // Gets time agnostic of timezone
        var timesheetEndDate = new Date(edVars[0], edVars[1] - 1, edVars[2]) // Gets ,yyyy, mm, dd]

        // Apply the "active" class if a timesheet has the current day in it. Otherwise, give "active" to the latest date
        var activeClass = ''
        if ((timesheetStartDate <= new Date().setHours(0, 0, 0, 0)) && (new Date().setHours(0, 0, 0, 0) <= timesheetEndDate)) {
            activeClass = 'active'
        } else if ((i == 0) && (timesheetStartDate >= new Date())) {
            activeClass = 'active'
        } else if ((i == (length - 1)) && (timesheetEndDate <= new Date())) {
            activeClass = 'active'
        }

        var clone = $('.timesheet', '#domtemplates').clone(true, true) // clone the Timesheet template - to search in this clone, use -= $(".elementclass", clone); =-
        clone.addClass(activeClass)
        clone.attr({ // set data attributes
            'data-startDate': $.format.date(timesheetStartDate, 'yyyy-MM-dd'),
            'data-endDate': $.format.date(timesheetEndDate, 'yyyy-MM-dd'),
            'data-sfId': timesheet.Id
        })
        if ((objectType == '') || (objectType == null) || (objectType == undefined)) {
            var titleLabel = 'Non-Work Allowances'
        } else {
            var titleLabel = 'Work Allowances'
        }
        // var titleLabel = 'Allowances'
        $('.title-label', clone).text(titleLabel)
        var startFriendlyDate = $.format.date(timesheetStartDate, 'MMM d')
        var endFriendlyDate = $.format.date(timesheetEndDate, 'MMM d')
        $('.days-header-date-range', clone).text(`${startFriendlyDate} - ${endFriendlyDate}`)

        // Get a list of the days in the date range, and build a day for each of them using the templates below
        var dateRange = []
        var tempDate = new Date(timesheetStartDate)
        while (tempDate <= timesheetEndDate) {
            dateRange.push(new Date(tempDate))
            tempDate.setDate(tempDate.getDate() + 1)
        }

        var dayBuilder = dateRange.map(buildDay)
        $('.day-container', clone).append(dayBuilder)
        clone.appendTo('#timesheets-container') // inject into timesheets container
    }).catch(function (error) {
        logToScreen(error)
        logToConsole(error)
    })
}

function buildDay(date) {
    //    logToConsole('Building Day - ' + date);
    var dayClone = $('.day', '#domtemplates').clone(true, true)
    var parsedDate = $.format.date(date, 'yyyy-MM-dd')
    dayClone.attr('data-date', parsedDate)
    if (date.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)) {
        dayClone.addClass('today')
    }
    // Friendly formats for dates, uses the jquery-dateformate library
    var friendlyDate = $.format.date(date, 'ddd, MMM d')
    var friendlyDateBrief = $.format.date(date, 'MMM d')
    var friendlyDayLong = $.format.date(date, 'ddd')
    var friendlyDayShort = $.format.date(date, 'd') + '<br />' + friendlyDayLong.substring(0, 2)
    var friendlyDayLong = $.format.date(date, 'd') + '<br />' + friendlyDayLong
    $('.title-value', dayClone).text(friendlyDate)
    $('.timesheet-today', dayClone).text(friendlyDateBrief)
    $('.day-weekday-label-short', dayClone).html(friendlyDayShort)
    $('.day-weekday-label-long', dayClone).html(friendlyDayLong)

    return dayClone
}

function buildTimesheetEntries(TimesheetEntries) {
    logToConsole('Building Allowances')
    return Promise.all(
        TimesheetEntries.map(buildTimesheetEntry)
    ).catch(function (error) {
        logToScreen(error)
    })
}

function buildTimesheetEntry(TimesheetEntry) {
    return new Promise(function (resolve, reject) {
        const tseStartMoment = moment(TimesheetEntry.StartTime)
        const tseEndMoment = moment(TimesheetEntry.EndTime)
        const typeClass = TimesheetEntry.FSLABB_IsNonWorkRelated__c === 'TRUE' ? 'non-work-order-related' : 'work-order-related'

        const tseStatus = TimesheetEntry.Status.toLowerCase()
        const statusClass = ['submitted', 'rejected', 'approved'].includes(tseStatus) ? tseStatus : 'new'

        // Get the number of minutes that have passed since 00:00 to the start time of this event
        const startTimeInMinutes = tseStartMoment.diff(tseStartMoment.clone().startOf('day'), 'minutes')
        // Create DurationInMinutes if it doesn't already exist
        if (!TimesheetEntry.DurationInMinutes) {
            TimesheetEntry.DurationInMinutes = tseEndMoment.diff(tseStartMoment, 'minutes')
        }

        // Clone the TimesheetEntry template and update the data values
        const entryClone = $('.timesheet-entry', '#domtemplates').clone(true, true)
        entryClone.addClass(`${statusClass} ${typeClass}`)
        // if ((!objectType && typeClass == 'non-work-order-related') || (workOrderId == TimesheetEntry.WorkOrderId)) {
            entryClone.addClass('editable')
        // }
        entryClone.attr({ // set data attributes
            'data-start-time': tseStartMoment.format(),
            'data-end-time': tseEndMoment.format(),
            'data-sfid': TimesheetEntry.Id,
            'data-tsewoid': TimesheetEntry.WorkOrderId,
            'data-tsewoliid': TimesheetEntry.WorkOrderLineItemId,
            'data-tsesaid': TimesheetEntry.FSLABB_ServiceAppointment_ref__c,
            'data-tsesaid': TimesheetEntry.FSLABB_ServiceAppointment_ref__c,
            'data-sapdoctype': TimesheetEntry.FSLABB_SAP_Document_Type__c,
            'data-overtimesucess': TimesheetEntry.FSLABB_Overtime_Success__c,
            'data-duration': TimesheetEntry.DurationInMinutes,
            'style': `top: ${startTimeInMinutes}px; height: ${TimesheetEntry.DurationInMinutes}px;`,
            'data-ts-entry': `${JSON.stringify(TimesheetEntry)}`
        })


        // Set the start and end times of the Timesheet Entry in the DOM
        const startingTime = tseStartMoment.format('HH:mm')
        const endingTime = tseEndMoment.isSame(tseStartMoment, 'day') ? tseEndMoment.format('HH:mm') : '24:00'
        $('.timesheet-entry-start-time .value', entryClone).text(startingTime)
        $('.timesheet-entry-end-time .value', entryClone).text(endingTime)

        const formattedEntryStartDate = tseStartMoment.format('YYYY-MM-DD')
        const localFormattedEntryStartDate = tseStartMoment.format('L')
        if(TimesheetEntry.DurationInMinutes <= 15){
            entryClone.find(".icon-actions").show();
            entryClone.find(".inline-icons-wraper").hide();
        } else{
            entryClone.find(".icon-actions").hide();
            entryClone.find(".inline-icons-wraper").show();
        }
        // Set the values on the template
        $('.title-value', entryClone).text(TimesheetEntry.Subject)
        // DATE
        $('.timesheet-entry-date .value', entryClone).text(localFormattedEntryStartDate)
        $('.timesheet-entry-date input', entryClone).val(localFormattedEntryStartDate)
        $('.timesheet-entry-date input', entryClone).attr('value', formattedEntryStartDate)
        $(entryClone).attr('data-date', formattedEntryStartDate)
        // START TIME
        $('.timesheet-entry-start-time .value', entryClone).text(startingTime)
        $('.timesheet-entry-start-time input', entryClone).val(startingTime)
        // END TIME
        $('.timesheet-entry-end-time .value', entryClone).text(endingTime)
        $('.timesheet-entry-end-time input', entryClone).val(endingTime)
        if (tseStatus !== 'submitted' && tseStatus !== 'approved') {
            if (($('body').hasClass('non-work-order-related') && typeClass == 'work-order-related') || ($('body').hasClass('work-order-related') && typeClass == 'non-work-order-related')) {
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-clone', entryClone).css('display', 'none')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-delete', entryClone).css('display', 'none')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-submit', entryClone).css('display', 'block')
           } else {
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-clone', entryClone).css('display', 'block')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-delete', entryClone).css('display', 'block')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-submit', entryClone).css('display', 'block')
           }
       } else if (tseStatus == 'submitted' || tseStatus == 'approved') {
           if (($('body').hasClass('non-work-order-related') && typeClass == 'work-order-related') || ($('body').hasClass('work-order-related') && typeClass == 'non-work-order-related')) {
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-edit', entryClone).css('display', 'none')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-clone', entryClone).css('display', 'none')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-delete', entryClone).css('display', 'none')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-submit', entryClone).css('display', 'none')
           }else if (($('body').hasClass('non-work-order-related') && typeClass == 'non-work-order-related') || ($('body').hasClass('work-order-related') && typeClass == 'work-order-related')) {
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-edit', entryClone).css('display', 'none')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-clone', entryClone).css('display', 'block')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-delete', entryClone).css('display', 'none')
               $('div.icon-actions-container div.inline-icons-wraper .action-icon-submit', entryClone).css('display', 'none')
           }
       }

        // Get Absence Type Name
       // var absenceTypeName = lookupData['FSLABB_Absence_Type'].find(x => x.Id === TimesheetEntry.FSLABB_Absence_Type_ref__c)

        // Populate label
        var tseLabel = `${TimesheetEntry.Subject} 
                        ${TimesheetEntry.WorkOrderNumber ? " - " + TimesheetEntry.WorkOrderNumber : ""} 
                        ${TimesheetEntry.AccountName ? " - " + TimesheetEntry.AccountName : ""} 
                        ${TimesheetEntry.SiteName ? " - " + TimesheetEntry.SiteName : ""}`
        $('.timesheet-entry-label .value', entryClone).text(tseLabel)

        // Get all divs in current TSE with data-sfAPI set and for each
        $('div.timesheet-entry-content div[data-sfAPI]', entryClone).each((index, content) => {
            const data_sfAPI = $(content).attr('data-sfAPI')

            if ($(content).hasClass('lookup')) {	// If it's a lookup
                // Set .value and input attribute data-id to TimesheetEntry.(data-sfAPI+'_ref__c')
                var sfAPI_ref = data_sfAPI + '_ref__c'
                // handle special cases with anomalous naming convention
                if (data_sfAPI == 'FSLABB_ActivityType') {
                    var sfAPI_ref = data_sfAPI + '__c'
                } else if (data_sfAPI == 'WorkOrderLineItem') {
                    var sfAPI_ref = data_sfAPI + 'Id'
                } else if (data_sfAPI == 'FSLABB_SD_Sales_Order_Line_Item__c') {
                    var sfAPI_ref = data_sfAPI

                }
                $('.value', content).attr('data-id', TimesheetEntry[sfAPI_ref])
                $('input', content).attr('data-id', TimesheetEntry[sfAPI_ref])

                if (data_sfAPI == 'FSLABB_Absence_Type' && absenceTypeName) {
                    $('input', content).attr('data-description', absenceTypeName.FSLABB_Description__c)
                }

                // Set .value and input value to TimesheetEntry.(data-sfAPI+'_Name__c')
                var sfAPI_name = data_sfAPI + '_Name__c'
                if (!TimesheetEntry[sfAPI_name] && TimesheetEntry[sfAPI_ref]) { // If offline TimesheetEntry[sfAPI_name] will be undefined
                    // Get lookup array for field
                    var fieldLookupArray = lookupData[data_sfAPI]
                    // Loop through array and get Name
                    if (typeof fieldLookupArray !== 'undefined') {
                        fieldLookupArray.forEach(function (lookupArray) {
                            if (lookupArray.Id == TimesheetEntry[sfAPI_ref]) {
                                if (data_sfAPI == 'WorkOrderLineItem' || data_sfAPI == 'FSLABB_ServiceAppointment') { // handle special case for WOLI and SA
                                    sfAPI_name = lookupArray.Subject
                                } else if (data_sfAPI == 'FSLABB_SD_Sales_Order_Line_Item__c') { // handle special case for Sales Order Line Item
                                    sfAPI_name = lookupArray.FSLABB_SAP_Description__c
                                } else {
                                    sfAPI_name = lookupArray.Name
                                }
                            }
                        })
                    }
                    $('.value', content).text(sfAPI_name)
                    $('input', content).val(sfAPI_name)
                } else {
                    $('.value', content).text(TimesheetEntry[sfAPI_name])
                    $('input', content).val(TimesheetEntry[sfAPI_name])
                }
            } else if ($(content).hasClass('picklist')) { // If it's a picklist
                // If there the field isn't unproductive code or there exists a value for the field
                if (data_sfAPI != 'FSLABB_UnproductiveCode__c' || TimesheetEntry[data_sfAPI]) {
                    // Set .value and input attribute data-id to TimesheetEntry.(data-sfAPI)
                    $('.value', content).attr('data-id', TimesheetEntry[data_sfAPI])
                    $('input', content).attr('data-id', TimesheetEntry[data_sfAPI])
                    // Get picklist id and get the name with it
                    var picklistValues = picklistData[data_sfAPI]
                    var picklistIndex = picklistValues.itemIds.indexOf(TimesheetEntry[data_sfAPI])
                    var sfAPI_name = picklistValues.itemLabels[picklistIndex]
                    // Set name values
                    $('.value', content).text(sfAPI_name)
                    $('input', content).val(sfAPI_name)

                } // Else field will populate with default values as described in html
            } else if ($(content).hasClass('checkbox')) { // If it's a checkbox

                // Set .value and input value to TimesheetEntry.(data-sfAPI)
                $('.value', content).text(TimesheetEntry[data_sfAPI])
                $('input, textarea', content).val(TimesheetEntry[data_sfAPI])
                // If TRUE check the checkbox
                if (TimesheetEntry[data_sfAPI] == 'TRUE') {
                    $('input', content).prop('checked', true)
                }
            } else {
                // Set .value and input value to TimesheetEntry.(data-sfAPI)
                $('.value', content).text(TimesheetEntry[data_sfAPI])
                $('input, textarea', content).val(TimesheetEntry[data_sfAPI])
            }
        })

        // Find the timesheet with the relevant TimeSheetId
        const correctTimesheet = $(`.timesheet[data-sfId='${TimesheetEntry.TimeSheetId}']`)

        // The date format on the "day" div is yyyy-MM-dd so we want to update the same here to find the correct days
        const correctDay = $(`.day[data-date='${formattedEntryStartDate}']`, correctTimesheet)

        // If a day has been matched above update the values and append the timesheetentry itself
        if (correctDay[0]) {
            // This will update the relevant and non-relevant time in the Day template
            // If there is no work order or workorder line item, relevant time is non-work-order related items
            if ((objectType === '') || (objectType === null) || (objectType === undefined)) {
                if (typeClass == 'work-order-related') { entryClone.addClass('nonrelated') } // Add the nonrelated class
                else { entryClone.addClass('related') } // Add the related class
            }
            // If there is a work order or workorder line item then relevant time is time related only to that workorder
            else if ((objectType.toLowerCase() == 'workorder') || (objectType.toLowerCase() == 'workorderlineitem')) {
                if ((typeClass == 'work-order-related') && (TimesheetEntry.WorkOrderId == workOrderId)) { entryClone.addClass('related') } // Add the related class
                else { entryClone.addClass('nonrelated') } // Add the nonrelated class
            }
            //implemented for overlapping
            var topheight = `${startTimeInMinutes}px-${TimesheetEntry.DurationInMinutes}px`
            entryClone.attr('data-topheight', topheight)
            // alert(topheight)
            // Append clone to day and you're done
            $('.day-timesheet-entry-container', correctDay).append(entryClone)
            resolve('done')
        } else {
            logToConsole(`Cannot find a correct day for Timesheet ID: ${TimesheetEntry.TimeSheetId} & Timesheet Entry ID: ${TimesheetEntry.Id} & Day: ${formattedEntryStartDate}`)
        }
    }).catch(function (error) {
        logToScreen(error)
        logToConsole(error)
    })
}

function buildInlineTsEntry(TimesheetEntryData, timesheetEntry) {
    hideInlineTSE()
    showInlineTSE()
    $(".inline-form-container")[0].style.top = "";
    $(".inline-timesheet-entry-table").find('.timesheet-entry.taddedrow').remove();
    TimesheetEntryData = JSON.parse(TimesheetEntryData)
    // Set the start and end times of the Timesheet Entry in the DOM
    const tseStartMoment = moment(TimesheetEntryData.StartTime)
    const tseEndMoment = moment(TimesheetEntryData.EndTime)
    // Create DurationInMinutes if it doesn't already exist
    if (!TimesheetEntryData.DurationInMinutes) {
        TimesheetEntryData.DurationInMinutes = tseEndMoment.diff(tseStartMoment, 'minutes')
    }
    const typeClass = TimesheetEntryData.FSLABB_IsNonWorkRelated__c === 'TRUE' ? 'non-work-order-related' : 'work-order-related'

    var tseStatus = TimesheetEntryData.Status.toLowerCase()
    //var timesheetStatus = ''
    if (timesheetEntry.hasClass('new')) {
        tseStatus = 'new'
    } else if (timesheetEntry.hasClass('submitted')) {
        tseStatus = 'submitted'
    } else if (timesheetEntry.hasClass('rejected')) {
        tseStatus = 'rejected'
    } else if (timesheetEntry.hasClass('approved')) {
        tseStatus = 'approved'
    } else {
        tseStatus = ''
    }
    const statusClass = ['submitted', 'rejected', 'approved'].includes(tseStatus) ? tseStatus : 'new'
    const startingTime = tseStartMoment.format('HH:mm')
    const endingTime = tseEndMoment.isSame(tseStartMoment, 'day') ? tseEndMoment.format('HH:mm') : '24:00'
    // $('.timesheet-entry-start-time .value', tsEntry).text(startingTime)
    //$('.timesheet-entry-end-time .value', tsEntry).text(endingTime)
    const durationinMin = round2Fixed(TimesheetEntryData.DurationInMinutes / 60)

    //// $('.timesheet-entry-duration input', tsEntry).val(durationinMin)
    // $('timesheet-entry-duration .value', tsEntry).text(durationinMin)
    const formattedEntryStartDate = tseStartMoment.format('YYYY-MM-DD')
    const localFormattedEntryStartDate = tseStartMoment.format('L')
    /* 
        // Set the values on the template
        $('.title-value', tsEntry).text(TimesheetEntryData.Subject)
        // DATE
        $('.timesheet-entry-date .value', tsEntry).text(localFormattedEntryStartDate)
        $('.timesheet-entry-date input', tsEntry).val(localFormattedEntryStartDate)
        $('.timesheet-entry-date input', tsEntry).attr('value', formattedEntryStartDate)
        $(tsEntry).attr('data-date', formattedEntryStartDate)
        // START TIME
        $('.timesheet-entry-start-time .value', tsEntry).text(startingTime)
        $('.timesheet-entry-start-time input', tsEntry).val(startingTime)
        // END TIME
        $('.timesheet-entry-end-time .value', tsEntry).text(endingTime)
        $('.timesheet-entry-end-time input', tsEntry).val(endingTime)
    */
    // Get Absence Type Name
    //var absenceTypeName = lookupData['FSLABB_Absence_Type'].find(x => x.Id === TimesheetEntryData.FSLABB_Absence_Type_ref__c)
    const entryClone = $('.inline-form-container')
    entryClone.removeClass('submitted rejected approved new')
    entryClone.addClass(`${statusClass}`)
    entryClone.find("div.trow:last").addClass('timesheet-entry active');
    //if ($('body').hasClass('view-day')) {
        entryClone[0].style.top = Number(timesheetEntry[0].style.top.split('px')[0]) + Number(timesheetEntry[0].style.height.split('px')[0]) + 'px';
    //}
    //entryClone.removeClass('view edit clone create').addClass('edit')
    //entryClone.addClass('edit')    
    if (timesheetEntry.hasClass('work-order-related')) {
        entryClone.find('.inline-timesheet-entry-table').addClass('work-order-related')
        entryClone.find('.inline-timesheet-entry-table').removeClass('non-work-order-related')
    } else if (timesheetEntry.hasClass('non-work-order-related')) {
        entryClone.find('.inline-timesheet-entry-table').addClass('non-work-order-related')
        entryClone.find('.inline-timesheet-entry-table').removeClass('work-order-related')
    }
    entryClone.attr('data-sfid', TimesheetEntryData.Id)
	entryClone.attr('data-tsewoid', TimesheetEntryData.WorkOrderId)
    entryClone.attr('data-tsewoliid', TimesheetEntryData.WorkOrderLineItemId)
    entryClone.attr('data-tsesaid', TimesheetEntryData.FSLABB_ServiceAppointment_ref__c)
    if (varWageOrAbsence == 'TRUE') {
        $('.timesheet-entry-FSLABB_Wage_Type_ref__c input.lookup', entryClone).prop('disabled', false);
        $('.timesheet-entry-FSLABB_Absence_Type_ref__c input.lookup', entryClone).prop('disabled', false);
    }
    // DATE
    $('.timesheet-entry-date .value', entryClone).text(setLocaleDateString(formattedEntryStartDate))
    $('.timesheet-entry-date input', entryClone).val(setLocaleDateString(formattedEntryStartDate))
    $('.timesheet-entry-date input', entryClone).attr('value', formattedEntryStartDate)
    $(entryClone).attr('data-date', formattedEntryStartDate)
    // START TIME
    $('.timesheet-entry-start-time .value', entryClone).text(startingTime)
    $('.timesheet-entry-start-time input', entryClone).val(startingTime)
    // END TIME
    $('.timesheet-entry-end-time .value', entryClone).text(endingTime)
    $('.timesheet-entry-end-time input', entryClone).val(endingTime)
    $('div.inline-timesheet-entry-table .tbody div[data-sfAPI]', entryClone).each((index, content) => {
        var data_sfAPI = $(content).attr('data-sfAPI')
        // Code for 50834
        if (
            country[userCountry]['show_allowance_fields'] &&
            country[userCountry]['show_allowance_fields'][userBusiness][userBUID] == 'TRUE' &&
            data_sfAPI == 'FSLABB_Allowance_Type_ref__c'
        ) {
            data_sfAPI = 'FSLABB_Allowance_Type'
        }

        if ($(content).hasClass('lookup')) { // If it's a lookup
            // Set .value and input attribute data-id to TimesheetEntryData.(data-sfAPI+'_ref__c')
            var sfAPI_ref = data_sfAPI + '_ref__c'
            // handle special cases with anomalous naming convention
            if (data_sfAPI == 'FSLABB_ActivityType') {
                var sfAPI_ref = data_sfAPI + '__c'
            } else if (data_sfAPI == 'WorkOrderLineItem') {
                var sfAPI_ref = data_sfAPI + 'Id'
            } else if (data_sfAPI == 'FSLABB_SD_Sales_Order_Line_Item__c') {
                var sfAPI_ref = data_sfAPI
            } else if (data_sfAPI == 'FSLABB_ABBOvertimeCategory__c') {
                var sfAPI_ref = 'FSLABB_ABBOvertimeCategory__c'
            } else if (data_sfAPI == 'FSLABB_Allowance_Type_ref__c') {
                var sfAPI_ref = 'FSLABB_Allowance_Type_ref__c'
            }
            //  code 33013
            else if (data_sfAPI == 'FSLABB_HrUp_Type') {
                var sfAPI_ref = 'HR_Up__c'
            } else if (data_sfAPI == 'FSLABB_HrDown_Type') {
                var sfAPI_ref = 'HR_Down__c'
            }

            //  code 33013
            $('.value', content).attr('data-id', TimesheetEntryData[sfAPI_ref])
            $('input', content).attr('data-id', TimesheetEntryData[sfAPI_ref])

            if (data_sfAPI == 'FSLABB_Absence_Type' && absenceTypeName) {
                $('input', content).attr('data-description', absenceTypeName.FSLABB_Description__c)
            }

            // Set .value and input value to TimesheetEntryData.(data-sfAPI+'_Name__c')
            var sfAPI_name = data_sfAPI + '_Name__c'
            if (!TimesheetEntryData[sfAPI_name] && TimesheetEntryData[sfAPI_ref]) { // If offline TimesheetEntryData[sfAPI_name] will be undefined
                // Get lookup array for field
                var fieldLookupArray = lookupData[data_sfAPI]
                // Loop through array and get Name
                if (typeof fieldLookupArray !== 'undefined') {
                    fieldLookupArray.forEach(function (lookupArray) {
                        if (lookupArray.Id == TimesheetEntryData[sfAPI_ref]) {
                            if (data_sfAPI == 'WorkOrderLineItem' || data_sfAPI == 'FSLABB_ServiceAppointment') { // handle special case for WOLI and SA
                                sfAPI_name = lookupArray.Subject
                            } else if (data_sfAPI == 'FSLABB_SD_Sales_Order_Line_Item__c') { // handle special case for Sales Order Line Item
                                sfAPI_name = lookupArray.FSLABB_SAP_Description__c
                            } else {
                                sfAPI_name = lookupArray.Name
                            }
                        }
                    })
                }
                $('.value', content).text(sfAPI_name)
                $('input', content).val(sfAPI_name)
            } else {
                $('.value', content).text(TimesheetEntryData[sfAPI_name])
                $('input', content).val(TimesheetEntryData[sfAPI_name])
            }
        } else if ($(content).hasClass('picklist')) { // If it's a picklist
            // If there the field isn't unproductive code or there exists a value for the field
            if (data_sfAPI != 'FSLABB_UnproductiveCode__c' || TimesheetEntryData[data_sfAPI]) {
                // Set .value and input attribute data-id to TimesheetEntryData.(data-sfAPI)
                $('.value', content).attr('data-id', TimesheetEntryData[data_sfAPI])
                $('input', content).attr('data-id', TimesheetEntryData[data_sfAPI])
                // Get picklist id and get the name with it
                var picklistValues = picklistData[data_sfAPI]
                //logToConsole('**picklistValues : ' + JSON.stringify(picklistValues));
                if (picklistValues !== undefined && picklistValues !== '' && picklistValues !== null) {
                    var picklistIndex = picklistValues.itemIds.indexOf(TimesheetEntryData[data_sfAPI])
                    if (picklistValues.itemIds) {
                        var sfAPI_name = picklistValues.itemLabels[picklistIndex]
                        // Set name values
                        $('.value', content).text(sfAPI_name)
                        $('input', content).val(sfAPI_name)
                    }

                }
            } // Else field will populate with default values as described in html
        } else if ($(content).hasClass('checkbox')) { // If it's a checkbox
            // Set .value and input value to TimesheetEntryData.(data-sfAPI)
            $('.value', content).text(TimesheetEntryData[data_sfAPI])
            $('input, textarea', content).val(TimesheetEntryData[data_sfAPI])
            // If TRUE check the checkbox
            if (TimesheetEntryData[data_sfAPI] == 'TRUE') {
                $('input', content).prop('checked', true)
            } else {
                $('input', content).prop('checked', false)
            }
        } else {
            // Set .value and input value to TimesheetEntryData.(data-sfAPI)
            if (data_sfAPI == "DurationInMinutes") {
                var durationInMinutes = moment.utc(moment(endingTime, "HH:mm").diff(moment(startingTime, "HH:mm"))).format("HH:mm")

                var totalMinutes = getTimeMinutesfromPretty(durationInMinutes)


                const durationinHrs = round2Fixed(totalMinutes / 60)
                $('.value', content).text(durationinHrs)
                $('input, textarea', content).val(durationinHrs)
            } else {
                // For US-95266
                if (data_sfAPI == "Description") {
                    $('textarea', content).show()
                    $('.value', content).hide()
                }
                $('.value', content).text(TimesheetEntryData[data_sfAPI])
                $('input, textarea', content).val(TimesheetEntryData[data_sfAPI])
            }
        }
    })

    // Find the timesheet with the relevant TimeSheetId
    const correctTimesheet = $(`.timesheet[data-sfId='${TimesheetEntryData.TimeSheetId}']`)

    // The date format on the "day" div is yyyy-MM-dd so we want to update the same here to find the correct days
    const correctDay = $(`.day[data-date='${formattedEntryStartDate}']`, correctTimesheet)

    // If a day has been matched above update the values and append the timesheetentry itself
    if (correctDay[0]) {
        // This will update the relevant and non-relevant time in the Day template
        // If there is no work order or workorder line item, relevant time is non-work-order related items
        if ((objectType === '') || (objectType === null) || (objectType === undefined)) {
            if (typeClass == 'work-order-related') {
                entryClone.addClass('nonrelated')
            } // Add the nonrelated class
            else {
                entryClone.addClass('related')
            } // Add the related class
        }
        // If there is a work order or workorder line item then relevant time is time related only to that workorder
        else if ((objectType.toLowerCase() == 'workorder') || (objectType.toLowerCase() == 'workorderlineitem')) {
            if ((typeClass == 'work-order-related') && (TimesheetEntryData.WorkOrderId == launchContext.workOrderId)) {
                entryClone.addClass('related')
            } // Add the related class
            else {
                entryClone.addClass('nonrelated')
            } // Add the nonrelated class
        }

        // Append clone to day and you're done        
        if ($('body').hasClass('view-day')) {
            $('.day-timesheet-entry-container', correctDay).find(timesheetEntry).after(entryClone)
        } else {
            $('.day-timesheet-entry-container', correctDay).find(timesheetEntry).after(entryClone)
        }
    } else {
        logToConsole(`Cannot find a correct day for Timesheet ID: ${TimesheetEntryData.TimeSheetId} & Timesheet Entry ID: ${TimesheetEntryData.Id} & Day: ${formattedEntryStartDate}`)
    }
    logToConsole('**timesheet-entry of compOverVal 5 : ' + $('div.title-value', entryClone).text() + '------' + TimesheetEntryData.FSLABB_OVT_HR_TSE__c);
    logToConsole('**timesheet-entry of compOverVal 7 : ' + $('.title-value', entryClone).text() + '------' + TimesheetEntryData.FSLABB_OVT_HR_TSE__c);
}












// This will sort the timesheet entries within their containers
// Pass "true" and it will only rearrange the ACTIVE timesheet (useful for updates, new TSE, etc)
function sortTimesheetEntries(onlyActive) {
    var timesheets
    if (onlyActive) { timesheets = $('div.timesheet.active') } else { timesheets = $('div.timesheet') }

    // For each timesheet
    timesheets.each((index, timesheet) => {
        // Get each of the TSE containers (within the days)
        var dayTSEContainers = $('div.day-timesheet-entry-container', timesheet)
        dayTSEContainers.each((index, container) => {
            // var timesheetEntries = $(container).children("div.timsheet-entry");
            var timesheetEntries = $('div.timesheet-entry:not(".tbody.timesheet-entry")', container)
            // Only need to sort if there is more than 1 TSE per day
            if (timesheetEntries.length > 1) {
                // Sort the TSEs
                timesheetEntries.sort((a, b) => {
                    return +new Date($(a).data('start-time')) - +new Date($(b).data('start-time'))
                })
            }

            timesheetEntries.appendTo(container)


        })
    })
}
function round2Fixed(value) {
    value = +value;
    if (isNaN(value))
        return NaN;
    // Shift
    value = value.toString().split('e')
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + 2) : 2)))
    // Shift back
    value = value.toString().split('e')
    value = (+(value[0] + 'e' + (value[1] ? (+value[1] - 2) : -2))).toFixed(2)
    return parseFloat(value)
}

function chartHeightsAndInitialize(onlyActive) {
    const timesheets = onlyActive ? $('div.timesheet.active') : $('div.timesheet')
    // Determine height of day bar charts
    timesheets.each(function () {
        let barChartMax = 10
        const dayBarCharts = $('div.day-barchart', this)
        const dayBarChartDurations = $('div.day-barchart div.total-duration', this)

        // Iterate through barcharts to find highest total-duration
        dayBarChartDurations.each(function () {
            // Get the duration and set max if it's the hightest so far
            const totalDuration = $(this).text()
            const hourMin = totalDuration
            const perc = parseInt((hourMin[1] / 6) * 10, 10)
            const hourPerc = parseFloat(parseInt(hourMin[0], 10) + '.' + (perc < 10 ? '0' : '') + perc)
            barChartMax = (hourPerc > barChartMax) ? hourPerc : barChartMax
        })

        // Too many uses of "this" could cause an error
        // Iterate through barcharts again to set height for bar charts
        dayBarCharts.each(function () {
            // Determine related duration & height and then set height
            const relatedDurationDom = $('span.related-duration', this)
            const relatedDuration = relatedDurationDom.text()
            const relatedHourMin = relatedDuration.split(':')
            const relatedPerc = parseInt((relatedHourMin[1] / 6) * 10, 10)
            const relatedHourPerc = parseFloat(parseInt(relatedHourMin[0], 10) + '.' + (relatedPerc < 10 ? '0' : '') + relatedPerc)
            const relatedHeight = (relatedHourPerc / barChartMax) * 100
            $('div.day-barchart-related', this).css('height', relatedHeight.toString() + '%')

            // Determine non-related duration & height and then set height
            const nonRelatedDurationDom = $('span.non-related-duration', this)
            const nonRelatedDuration = nonRelatedDurationDom.text()
            const nonRelatedHourMin = nonRelatedDuration.split(':')
            const nonRelatedPerc = parseInt((nonRelatedHourMin[1] / 6) * 10, 10)
            const nonRelatedHourPerc = parseFloat(parseInt(nonRelatedHourMin[0], 10) + '.' + (nonRelatedPerc < 10 ? '0' : '') + nonRelatedPerc)
            const nonRelatedHeight = (nonRelatedHourPerc / barChartMax) * 100
            $('div.day-barchart-non-related', this).css('height', nonRelatedHeight.toString() + '%')
        })
    })

    // Update timesheet entry status chart
    timesheetEntryStatusChart(onlyActive)

    // Get current date in format yyyy-mm-dd
    const currentDate = moment().format('YYYY-MM-DD')

    // Find day that matches & the day-barchart-today within it and .show
    // We only want this to happen when the view is set to "view-timesheets" otherwise it gives odd behaviours
    if ($('body').hasClass('view-timesheets')) {
        $(`div.day[data-date=${currentDate}] div.day-barchart-today`).show()
    }
    scrollToToday()
}

function timesheetEntryStatusChart(onlyActive) {
    const timesheetEntryStatus = onlyActive ? $('div.timesheet.active div.timesheet-entry-status') : $('div.timesheet-entry-status')
    // For each timesheet entry status chart update with percents
    timesheetEntryStatus.each(function () {
        // Get values or new, submitted, rejected, and approved timesheet entry status
        const newStatus = parseFloat($('div.timesheet-entry-status-text-new span.value', this).text()) || 0
        const submittedStatus = parseFloat($('div.timesheet-entry-status-text-submitted span.value', this).text()) || 0
        const rejectedStatus = parseFloat($('div.timesheet-entry-status-text-rejected span.value', this).text()) || 0
        const approvedStatus = parseFloat($('div.timesheet-entry-status-text-approved span.value', this).text()) || 0
        const totalStatus = newStatus + submittedStatus + rejectedStatus + approvedStatus

        // Calculate the New percentage, apply it to the chart
        const newPercent = (newStatus / totalStatus) * 100 || 0
        $('div.timesheet-entry-status-chart-new', this).css('width', `${newPercent}%`)

        // Calculate the New percentage, apply it to the chart
        const submittedPercent = (submittedStatus / totalStatus) * 100 || 0
        $('div.timesheet-entry-status-chart-submitted', this).css('width', submittedPercent.toString() + '%')

        // Calculate the New percentage, apply it to the chart
        const rejectedPercent = (rejectedStatus / totalStatus) * 100 || 0
        $('div.timesheet-entry-status-chart-rejected', this).css('width', rejectedPercent.toString() + '%')

        // Calculate the New percentage, apply it to the chart
        const approvedPercent = (approvedStatus / totalStatus) * 100 || 0
        $('div.timesheet-entry-status-chart-approved', this).css('width', approvedPercent.toString() + '%')
    })

    // Get current date in format yyyy-mm-dd
    const currentDate = moment().format('YYYY-MM-DD')

    // Find day that matches & the day-barchart-today within it and .show
    if ($('body').hasClass('view-timesheets')) {
        $(`div.day[data-date=${currentDate}] div.day-barchart-today`).show()
        scrollToToday()
    }
}

function updateTimesheetTotals(onlyActive) {
    var timesheets
    if (onlyActive) {
        timesheets = $('div.timesheet.active')
    } else {
        timesheets = $('div.timesheet')
    }

    timesheets.each((i, timesheet) => {
        // Get days for timesheet entry
        var timesheetDays = $('.day-container', timesheet).children('div.day')
        // TSE Status counters
        var statusNew = 0
        var statusSubmitted = 0
        var statusApproved = 0
        var statusRejected = 0
		var statusTotal = 0
        // Timesheet totals
        var timesheetRelatedHours = 0
        var timesheetNonRelatedHours = 0

        // For each day
        timesheetDays.each((index, day) => {
            var dayRelatedHours = 0
            var dayNonRelatedHours = 0
            var dayTimesheetEntries = $('.day-timesheet-entry-container', day).find('div.timesheet-entry').not('.inline-form-container')
            topHeightArray = []
            // For each TSE
            dayTimesheetEntries.each((index, tse) => {

                // var timesheetStartTime = new Date($(tse).attr('data-start-time'))
                //  var timesheetEndTime = new Date($(tse).attr('data-end-time'))
                //  var durationInHours = Math.round((timesheetEndTime - timesheetStartTime) / (60000)) / 60 // 60000 is minutes, *60 for hours
                if ($(tse).hasClass('related')) {
                    dayRelatedHours++
                    timesheetRelatedHours++
                } else {
                    dayNonRelatedHours++
                    timesheetNonRelatedHours++
                }
                if ($(tse).hasClass('new')) {

                    statusNew += 1
                } else if ($(tse).hasClass('submitted')) {
                    statusSubmitted += 1
                }
                else if ($(tse).hasClass('approved')) {
                    statusApproved += 1
                }
                else {
                    statusRejected += 1
                }
				statusTotal = statusNew + statusSubmitted + statusApproved + statusRejected
                //ADO 130177
                var topHeight = $(tse).attr('data-topheight')
                if(typeof topHeight !== 'undefined'){
                var tseTopHeights = topHeight.split("-")
                var tseTop=tseTopHeights[0]
                var tseheight=tseTopHeights[1]
                topHeightArray.push(topHeight)
                $(tse).css({"top": tseTop, "height": tseheight});
                if($(tse).parent().hasClass("multiple-timesheet-entry")){
                    $(tse).detach().appendTo(".day-timesheet-entry-container")
                }
}
            })

            //implemented for overlapping
            topHeightArray = topHeightArray.filter((x, i, a) => a.indexOf(x) === i)
            var topHeightArrayLength = topHeightArray.length;
            if (topHeightArrayLength > 0) {
                for (var i = 0; i < topHeightArrayLength; i++) {
                    var topHeightElement = topHeightArray[i]
                    if ($("div[data-topheight='" + topHeightElement + "']", day).length > 1) {
                        if ($("div." + topHeightElement, day).length > 0) {
                            $("div." + topHeightElement, day).remove()
                        }
                        var topHeights = topHeightElement.split("-")
                        var topDiv = topHeights[0]
                        var heightDiv = topHeights[1]
                        var topHeightValue=parseInt(topDiv.replace(/px/, ''));
                        var heightDivValue=parseInt(heightDiv.replace(/px/, ''));
                        var totalHeight=topHeightValue+heightDivValue;
                        $("div[data-topheight='" + topHeightElement + "']", day).wrapAll("<div class='" + topHeightElement + " multiple-timesheet-entry' data-height="+totalHeight+" style='top:" + topDiv + "; height:" + heightDiv + "'></div>");
                        $("div[data-topheight='" + topHeightElement + "']", day).removeAttr('style')
                    }

                }
            }
            // console.log($(day).attr('data-date') + ':' + topHeightArray)
            // Remove the inline style for the days. These will be re-applied with chartheights function
            $('.day-barchart-related', day).removeAttr('style')
            $('.day-barchart-non-related', day).removeAttr('style')
            $('.day-barchart-total', day).removeAttr('style')

            // Update values on the day
            $('.day-header-total-hours-non-related .non-related-duration', day).text(dayNonRelatedHours) // Make pretty
            $('.day-header-total-hours-non-related .non-related-duration', day).attr('data-non-related-hours', dayNonRelatedHours)
            $('.day-header-total-hours-related .related-duration', day).text(dayRelatedHours) // Make pretty
            $('.day-header-total-hours-related .related-duration', day).attr('data-related-hours', dayRelatedHours)
            $('.day-header-text .total-duration', day).text(dayRelatedHours + dayNonRelatedHours) // Make pretty
            $('.day-header-text .total-duration', day).attr('data-total-duration', dayRelatedHours + dayNonRelatedHours)

            // Populate the bar chart totals for the day
            if ((dayRelatedHours + dayNonRelatedHours) > 0) $('.day-barchart-total .total-duration', day).text(dayRelatedHours + dayNonRelatedHours)
            else $('.day-barchart-total .total-duration', day).text('')
            if (dayNonRelatedHours > 0.00) $('.day-barchart-non-related .non-related-duration', day).text(dayNonRelatedHours)
            else $('.day-barchart-non-related .non-related-duration', day).text('')
            if (dayRelatedHours > 0.00) $('.day-barchart-related .related-duration', day).text(dayRelatedHours)
            else $('.day-barchart-related .related-duration', day).text('')
        })

        // Update timesheet values
        $('.days-header-total-hours-non-related .non-related-duration', timesheet).text(timesheetNonRelatedHours) // Make pretty
        $('.days-header-total-hours-non-related .non-related-duration', timesheet).attr('data-non-related-hours', timesheetNonRelatedHours)
        $('.days-header-total-hours-related .related-duration', timesheet).text(timesheetRelatedHours) // Make pretty
        $('.days-header-total-hours-related .related-duration', timesheet).attr('data-related-hours', timesheetRelatedHours)
        $('.days-header-total .total-duration', timesheet).text(timesheetRelatedHours + timesheetNonRelatedHours) // Make Pretty
        $('.days-header-total .total-duration', timesheet).attr('data-total-hours', timesheetNonRelatedHours + timesheetNonRelatedHours)

        // Set the status  for the timesheet
        $('.timesheet-entry-status-text-new .value', timesheet).text(statusNew)
        $('.timesheet-entry-status-text-approved .value', timesheet).text(statusApproved)
        $('.timesheet-entry-status-text-submitted .value', timesheet).text(statusSubmitted)
        $('.timesheet-entry-status-text-rejected .value', timesheet).text(statusRejected)
		$('.timesheet-entry-status-text-total .value', timesheet).text(statusTotal)
    })
}

// Call this function any time you switch timesheets - this will ensure that Today is in view, if the timesheet contains Today
function scrollToToday() {
    const currentDate = moment().format('YYYY-MM-DD')
    // Get the active timesheet, and the dayContainer for the active timesheet
    const activeTimesheet = $('.timesheet.active')
    const dayContainer = $('.day-container', activeTimesheet)
    // Get the first day of the timesheet
    const firstDay = dayContainer.children('div').first()
    // The DOM for Today
    const todayDom = $(`div.day[data-date=${currentDate}]`)
    // Check if Today is in the Active timesheet container
    if ($(`div.day[data-date=${currentDate}]`, dayContainer).length > 0) {
        logToConsole('Today is in the active sheet')
        // Today properties
        const dayPositionLeft = (todayDom.position().left - parseFloat(dayContainer.css('margin-left')))
        const dayWidth = todayDom.width()
        const dayPositionRight = dayPositionLeft + dayWidth
        // Container properties
        const dayContainerWidth = dayContainer.width()
        // Left position of the first day
        const firstDayLeft = firstDay.position().left - parseFloat(dayContainer.css('margin-left'))

        if (dayPositionRight > dayContainerWidth) {
            logToConsole('The right of the day is outside the right of the container')
            // Work out how much the day is off the screen
            const rightCorrection = (dayPositionRight - dayContainerWidth) + parseFloat(todayDom.css('margin-left'))
            // Work out how many pixels today is from the first day and add the correction
            const rightOffset = Math.abs(firstDayLeft) + rightCorrection
            dayContainer.scrollLeft(rightOffset)
        } else if (dayPositionLeft < 0) {
            logToConsole('The left of the day is outside the left of the container')
            // Work out how many pixels today is from the first day
            // The first day is going to have a larger absolute value since it will be further left
            const leftOffset = Math.abs(firstDayLeft) - Math.abs(dayPositionLeft)
            dayContainer.scrollLeft(leftOffset)
        }
    }
}

// Get param value based on key from the URL
function getQueryVariable(variableKey) {
    var query = window.location.search.substring(1)
    var vars = query.split('&')
    for (i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        if (pair[0] == variableKey) {
            return pair[1]
        }
    }
}

function showDayListView() {
    if ($('div.timesheet.active div.day.active div.timesheet-entry.rejected').hasClass('editable')) {
        //var tseDataId = $('.timesheet-entry.rejected').attr('data-sfid')
        var tsewoid = $('div.timesheet.active div.day.active div.timesheet-entry.rejected').attr('data-tsewoid')
        if (tsewoid != workOrderId) {
            $('div.timesheet.active div.day.active div.timesheet-entry.rejected').removeClass('editable')
        }
    }
    if ((objectType == '') || (objectType == null) || (objectType == undefined)) {
        if ($('div.timesheet.active div.day.active div.timesheet-entry.rejected').hasClass('non-work-order-related')) {
            $('div.timesheet.active div.day.active div.timesheet-entry.rejected').addClass('editable')
        }
    }
    $('.day.active').attr('data-scroll', $('.day.active .day-calendar-content').scrollTop()) // stores current scroll position so we can get back to it
    $('body').addClass('view-day-list').removeClass('view-day')
}

function addTimeSheetEntry(context, timeslot, parsedDateValue) {
    if ($('.inline-form-container:visible:not(.view)').length > 0) {
        showDiscardInlineTspopup("addTimeSheet");
    } else {
    if (context == "timesheetGlobal") {
        showTimesheetEntryStatusView('Total')
        }
    inlineTsEntry = true;
    dayInlineTSClick = false;
    if ($('.inline-form-container:visible:not(.view)').length > 0) {
        dayInlineTSClick = true;
            }
    if (dayInlineTSClick === false) {
        hideInlineTSE()
        var selectedDateContainer;
        var dayContainerToAppend;
        inlineTsEntry = true;
        //$('.icon-add-timesheet-entry').addClass('disabled')
        $('.inline-form-container').removeClass('view edit clone create global_create').addClass('create global_create')
        $('.tcolumn.action-inline-btn').show()
        $('.tcolumn.tcolumn_new').show()
        $('.inline-form-container').removeClass('rejected approved submitted new').addClass('new')
        $('.inline-form-container button.inline-save-btn').attr('disabled', true)
        if (context == "timesheetGlobal") {
        //day global_inline
        $(".inline-form-container").insertBefore(".timesheet.active .days-container .day-container .day:first");
        if ($(".day").hasClass("global_inline")) {
        $(".global_inline:not(.active)").remove()
        }
        $('.inline-form-container').wrapAll('<div class="day global_inline active"></div>')
        $(".global_create").closest(".day").attr("data-date", "")
        $('.global_create div.timesheet-entry-date input').removeAttr('id')
            } else {
                $(".inline-form-container").insertBefore(".timesheet.active .day.active .day-calendar-background .time-slot:first .time-slot-entry-day");
            let TSInlineHeight = $(".inline-form-container").height();
            $(".timesheet.active .day.active .day-calendar-background .time-slot:first").css({ "padding-top": TSInlineHeight + 10 })
        }
        // $('.icon-add-timesheet-entry').addClass("disabled")

        dayInlineTSClick = true;

        showInlineTSE()
        //  $(ele).closest(".day").find('.inline-form-container').css({ display: 'block' });
        resetInlineFields()
        //enableDisableAddbutton();

        if (inlineTsEntry) {
            tsElement = '.inline-timesheet-entry-table'
        } else {
            tsElement = '.timesheet-entry.active'
        }
        addTimeSheetLineEntry(context)
        //tsEntryRow = $(".inline-timesheet-entry-table").find("div.trow:last").clone(true,true);
        if ($(".inline-timesheet-entry-table").find("div.tbody.trow").length == 1) {
            $(".inline-timesheet-entry-table").find('div.tbody.trow:first .delete-ts-entry').hide()
        }
        enableAndDisableIcons()
        }
}
}

function getTseWorkOrderId(datasfid) {
    //var sfid = $('.timesheet-entry.active').attr('data-sfid')
    var filterVar = activityTypeVar.filter(function (item) {
        return (item.Id == datasfid)
    });

    // if (filterVar != null) {
        //     workOrderIdTSE = filterVar[0].WorkOrderId
        //     workOrderLineItemIdTSE = filterVar[0].WorkOrderLineItemId
        //     unproductiveCodeTSE = filterVar[0].FSLABB_UnproductiveCode__c
        //     unproductiveCodeNameTSE = filterVar[0].FSLABB_UnproductiveCode_Name__c
    // }
}

// This function will save new and updated Timesheet Entries
function saveTimesheetEntry(context, tseSubmit = false) {
    // Get the active TSE
    const timesheetEntry = $('.timesheet-entry.active')
    var getObjectStatus = $('.timesheet-entry.active').hasClass('work-order-related')

    var isRejected = $('.timesheet-entry.active').hasClass('rejected')

    // Get the required values
    const timesheetId = $('.timesheet.active').attr('data-sfid')


    const tsewoid = $('.timesheet-entry.active').attr('data-tsewoid')
    const tsewoliid = $('.timesheet-entry.active').attr('data-tsewoliid')
    const tsesaid = $('.timesheet-entry.active').attr('data-tsesaid')


    const date = $('.timesheet-entry-date input', timesheetEntry).attr('value')
    const startTime = $('.timesheet-entry-start-time input', timesheetEntry).val()
    const endTime = $('.timesheet-entry-end-time input', timesheetEntry).val()
    // parse Local Time (the time offset will come from the user's device configuration)
    const startMoment = moment(`${date}T${startTime}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
    const endMoment = moment(`${date}T${endTime}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
    const durationInMinutes = endMoment.diff(startMoment, 'minutes') + ''
    // Create the JSAPI request object
    const request = {
        'type': '',
        'object': 'TimeSheetEntry',
        'data': {
            'RecordTypeId': '', // if page launch context is Non-work-order-related then "0120O000000ksqHQAQ" else "0120O000000ksqIQAQ"
            'TimeSheetId': timesheetId, // sfid of active Timesheet
            'StartTime': startMoment.utc().format(), // provide the time in UTC format
            'EndTime': endMoment.utc().format(), // provide the time in UTC format
            'DurationInMinutes': durationInMinutes,
            'FSLABB_ServiceResourceUser_ref__c': userId, // provide user id in case user is working offline
            'IsDeleted': 'FALSE' // Provide IsDeleted in case user is working offline
            // Do not set as either not used or auto-populated at Salesforce end            "FSLABB_Country__c": userCountry // we use the user's Country
        }
    }

    // if create new or clone set the Status to New and the request type to 'create'
    if (context != 'update') {
        request.data.Status = 'New'
        request.type = 'create'
        // else set the request type to 'update' and add Id to data;
    } else {
        request.type = 'update'
        // if timesheet status is rejected and got updated its status changed it to new / M_024
        if (timesheetEntry.hasClass('rejected')) {
            if (tseSubmit == true) {
                request.data.Status = 'Submitted'
            }
            else {
                request.data.Status = 'New'
            }
        }
        request.data.Id = timesheetEntry.attr('data-sfid')
    }

    if (tseSubmit == true || isRejected == true) {
        if (getObjectStatus) {
            request.data.RecordTypeId = workOrderRelated
            request.data.FSLABB_IsNonWorkRelated__c = 'FALSE' // This value will be overwritten if in Pulsar and online
            request.data.FSLABB_ServiceAppointment_ref__c = tsesaid // Set FSLABB_ServiceAppointment_ref__c if WO/WOLI related
        } else {
            request.data.RecordTypeId = nonWorkOrderRelated
            request.data.FSLABB_IsNonWorkRelated__c = 'TRUE' // This value will be overwritten if in Pulsar and online
        }

        // Set the workOrderId if applicable
        if (tsewoid) {
            request.data.WorkOrderId = tsewoid // Only need to set this if workOrderId not null
        }

        // Set the workOrderLineItemId if applicable
        if (tsewoliid) {
            request.data.WorkOrderLineItemId = tsewoliid // Only need to set this if workOrderLineItemId not null
        }
    }
    else {
        if (objectType) {
            request.data.RecordTypeId = workOrderRelated
            request.data.FSLABB_IsNonWorkRelated__c = 'FALSE' // This value will be overwritten if in Pulsar and online
            request.data.FSLABB_ServiceAppointment_ref__c = saId // Set FSLABB_ServiceAppointment_ref__c if WO/WOLI related
        } else {
            request.data.RecordTypeId = nonWorkOrderRelated
            request.data.FSLABB_IsNonWorkRelated__c = 'TRUE' // This value will be overwritten if in Pulsar and online
        }

        // Set the workOrderId if applicable
        if (workOrderId) {
            request.data.WorkOrderId = workOrderId // Only need to set this if workOrderId not null
        }

        // Set the workOrderLineItemId if applicable
        if (workOrderLineItemId) {
            request.data.WorkOrderLineItemId = workOrderLineItemId // Only need to set this if workOrderLineItemId not null
        }
    }


    // Set other variables
    // extract field name
    const getFieldName = element => {
        const apiName = element.attr('data-sfAPI')
        // common case
        if (!element.hasClass('lookup')) return apiName
        // handle special cases of inconsistent lookup naming
        const lookupName = {
            // 'FSLABB_ActivityType': 'FSLABB_ActivityType__c',
            'WorkOrderLineItem': 'WorkOrderLineItemId',
            'FSLABB_SD_Sales_Order_Line_Item__c': 'FSLABB_SD_Sales_Order_Line_Item__c'
        }
        return apiName in lookupName ? lookupName[apiName] : `${apiName}_ref__c`
    }

    // extract field value
    const getFieldValue = element => {
        const field = $('input, textarea', element)
        if (field.hasClass('lookup') || field.hasClass('picklist')) {
            return field.attr('data-id')
        } else if (field.hasClass('checkbox')) {
            return field.is(':checked') ? 'TRUE' : 'FALSE'
        } else {
            return field.val()
        }
    }

    // check wether we want to include this field or not
    const validField = (fieldName, fieldValue, element) => {
        const field = $('input, textarea', element)
        const constraints = [
            () => fieldName === 'FSLABB_Reject_Reason__c', // this field is never included
            () => field.hasClass('lookup') && !fieldValue, // a lookup with no value is not included
            //() => fieldName === 'FSLABB_UnproductiveCode__c' && objectId // can't be an UnproductiveCode field on WO/WOLI
        ]
        return !constraints.find(constraint => constraint())
    }

    // Get all other field containers (divs with data-sfAPI set) in current TSE and for each
    $('div.timesheet-entry-content div[data-sfAPI]', timesheetEntry).each((index, content) => {
        const fieldContainer = $(content)
        const fieldName = getFieldName(fieldContainer)
        const fieldValue = getFieldValue(fieldContainer)
        if (validField(fieldName, fieldValue, fieldContainer)) {
            request.data[fieldName] = fieldValue
        }
    })

    // Show the loading screen while this all gets processed
    //  $('body').removeClass('view-timesheet-entry-edit')
    // $('body').addClass('view-processing')
    changeBodyClass('view-timesheet-entry-edit', 'view-processing')
    // logToConsole(`request: ${JSON.stringify(request)}`)

    request.data['FSLABB_TimeEntryType__c'] = 'Allowance'


    if (request.data['FSLABB_Allowance_Type_ref__c'] != '') {

        var isDataCurrency = $("div#FSLABB_Allowance_Type table.lookup-table tr[data-sfid='" + request.data['FSLABB_Allowance_Type_ref__c'] + "']").attr("data-iscurrency")

        if (!isDataCurrency || isDataCurrency == undefined || isDataCurrency == 'FALSE') {
            request.data['FSLABB_Allowance_Amount_Currency__c'] = ''
        }
    }

    // Call the JSAPI to create the new TSE
    callJSAPI(request.type, request.data, request.object).then(function (result) {
        // if an update then we know the id else we get the one returned from the create call
        const recordId = (context === 'update') ? timesheetEntry.attr('data-sfid') : result
        // On response, do a read to get the new TSE data
        const newRequest = {
            'type': 'select',
            'object': 'TimeSheetEntry',
            'data': {
                'query': `SELECT TSE.Id AS Id,
                            TSE.Description AS Description,
                            TSE.DurationInMinutes AS DurationInMinutes,
                            TSE.EndTime AS EndTime,
                            TSE.TimeSheetEntryNumber AS TimeSheetEntryNumber,
                            TSE.FSLABB_ServiceAppointment_ref__c AS FSLABB_ServiceAppointment_ref__c,
                            TSE.FSLABB_ServiceAppointment_Name__c AS FSLABB_ServiceAppointment_Name__c,
                            TSE.FSLABB_Absence_Type_ref__c AS FSLABB_Absence_Type_ref__c,
                            TSE.FSLABB_Absence_Type_Name__c AS FSLABB_Absence_Type_Name__c,
                            TSE.FSLABB_ActivityType__c AS FSLABB_ActivityType_ref__c,
                            TSE.FSLABB_ActivityType_Name__c AS FSLABB_ActivityType_Name__c,
                            TSE.FSLABB_Allowance_Amount__c AS FSLABB_Allowance_Amount__c,
                            TSE.FSLABB_Allowance_Amount_Currency__c AS FSLABB_Allowance_Amount_Currency__c,
                            TSE.FSLABB_Allowance_Amount_Currency_Name__c AS FSLABB_Allowance_Amount_Currency_Name__c,
                            TSE.FSLABB_Allowance_Type_ref__c AS FSLABB_Allowance_Type_ref__c,
                            TSE.FSLABB_Allowance_Type_Name__c AS FSLABB_Allowance_Type_Name__c,
                            TSE.FSLABB_Bank_Time__c AS FSLABB_Bank_Time__c,
                            TSE.FSLABB_Category_ref__c AS FSLABB_Category_ref__c,
                            TSE.FSLABB_Category_Name__c AS FSLABB_Category_Name__c,
                            TSE.FSLABB_CostCenter__c AS FSLABB_CostCenter__c,
                            TSE.FSLABB_IsNonWorkRelated__c AS FSLABB_IsNonWorkRelated__c,
                            TSE.FSLABB_OtherOrderType__c AS FSLABB_OtherOrderType__c,
                            TSE.FSLABB_OtherOrderType_Name__c AS FSLABB_OtherOrderType_Name__c,
                            TSE.FSLABB_OvertimeCompensationAllowance__c AS FSLABB_OvertimeCompensationAllowance__c,
                            TSE.FSLABB_OvertimeCompensationAllowance_Nam__c AS FSLABB_OvertimeCompensationAllowance_Name__c,
                            TSE.FSLABB_Reject_Reason__c AS FSLABB_Reject_Reason__c,
                            TSE.FSLABB_TimeEntryType__c AS FSLABB_TimeEntryType__c,
                            TSE.FSLABB_Country__c AS FSLABB_Country__c,
                            TSE.FSLABB_TimeEntryType_Name__c AS FSLABB_TimeEntryType_Name__c,
                            TSE.FSLABB_UnproductiveCode__c AS FSLABB_UnproductiveCode__c,
                            TSE.FSLABB_UnproductiveCode_Name__c AS FSLABB_UnproductiveCode_Name__c,
                            TSE.FSLABB_Wage_Type_ref__c AS FSLABB_Wage_Type_ref__c,
                            TSE.FSLABB_Wage_Type_Name__c AS FSLABB_Wage_Type_Name__c,
                            TSE.FSLABB_SD_Sales_Order_Line_Item__c AS FSLABB_SD_Sales_Order_Line_Item__c,
                            TSE.FSLABB_SAPId__c AS FSLABB_SAPId__c,
                            TSE.FSLABB_SAPOperation__c AS FSLABB_SAPOperation__c,
                            TSE.StartTime AS StartTime,
                            TSE.Status AS Status,
                            TSE.Subject AS Subject,
                            TSE.TimeSheetId AS TimeSheetId,
                            TSE.WorkOrderId AS WorkOrderId,
                            TSE.WorkOrderLineItemId AS WorkOrderLineItemId,
                            TSE.LastModifiedDate AS LastModifiedDate,
                            WOLI.Subject AS WorkOrderLineItem_Name__c,
                            WO.WorkOrderNumber AS WorkOrderNumber,
                            AC.Name AS AccountName,
                            LO.Name AS SiteName
                        FROM TimeSheetEntry TSE 
                            Left Join WorkOrderLineItem WOLI ON WOLI.Id=TSE.WorkOrderLineItemId
                            Left Join WorkOrder WO on WO.Id=TSE.WorkOrderId
                            Left Join Account AC on AC.Id=WO.AccountId
                            Left Join Location LO on LO.Id=WO.FSLABB_Site__c
                          WHERE TSE.Id = '${recordId}' and  TSE.FSLABB_Allowance__c = 'TRUE'
                          LIMIT 1`
            }
        }

        // if offline we simulate this by passing the whole result in the data which then gets sent straight back //REMOVE ON PRODUCTION
        if (!inPulsar) { newRequest.data[0] = result }
        // Get the required data from the new TSE
        callJSAPI(newRequest.type, newRequest.data, newRequest.object).then((readResult) => {
            if (request.data.FSLABB_Allowance__c && request.data.FSLABB_Allowance__c == 'TRUE') {
                // Build the proper, permanent TSE
                buildTimesheetEntry(readResult[0]).then(() => {
                    // Remove the dummy day container (if created from timesheets view) and/or the current TSE (because we have replaced it with a new version)
                    const parentDay = timesheetEntry.closest('.day')
                    if ((parentDay.attr('data-date') == '') || (parentDay.attr('data-date') == undefined)) { // is this a dummy day container
                        parentDay.removeClass('active')
                        parentDay.remove() // Remove the dummy day container
                    } else {
                        timesheetEntry.remove()// Remove the editable temporary TSE
                    }


                    // Sort the timesheet entries for this timesheet onlym
                    sortTimesheetEntries(true)
                    // Update the Days Totals for this timesheet only
                    updateTimesheetTotals(true)
                    // Update the heights of charts, etc
                    chartHeightsAndInitialize(true)

                    // Remove active from the current day and set the target date to be active
                    $('div.day.active').removeClass('active')
                    if (launchViewContext != 'view-timesheets') { $(`div.day[data-date=${date}]`).addClass('active') }

                    // Show the screen again
                    //  $('body').removeClass('view-processing')
                    // Switch the view back to the required view and set the proper scroll position
                    // $('body').addClass(launchViewContext)
                    if(totalSatusSelected == true){
						changeBodyClass('view-timesheets filter-new filter-submitted filter-rejected filter-approved view-processing', 'view-timesheet-entry-status filter-' + status.toLowerCase())
				   }else{
					  changeBodyClass('view-processing', launchViewContext) 
				   }
                    // Get the number of minutes that have passed since 00:00 to the time of now
                    const currentTimeInMinutes = moment.duration(startTime).asMinutes()
                    // Get half the height of the active day calendar content container
                    const heightOffset = $('div.day.active div.day-calendar-content').height() / 2
                    // This will scroll so that the current time is roughly in the middle
                    $('div.day.active div.day-calendar-content').scrollTop(currentTimeInMinutes - heightOffset)
                    // set scroll attribute if not in view-day
                    $('div.day.active').attr('data-scroll', currentTimeInMinutes - heightOffset)
                })
            } else {
                // Remove active from the current day and set the target date to be active
                $('div.day.active').removeClass('active')
                if (launchViewContext != 'view-timesheets') { $(`div.day[data-date=${date}]`).addClass('active') }

                //  $('body').removeClass('view-processing')
                // Switch the view back to the required view and set the proper scroll position
                //  $('body').addClass(launchViewContext)
                if(totalSatusSelected == true){
					changeBodyClass('view-timesheets filter-new filter-submitted filter-rejected filter-approved view-processing', 'view-timesheet-entry-status filter-' + status.toLowerCase())
				}else{
					changeBodyClass('view-processing', 'view-timesheet-entry-edit')
				}
            }
        }).catch(function (error) {
            logToConsole(`error: error queryting TSE: ${error}`)
        })
    },
        function () { // on reject, close loading data and let user fix validation error returned
            //   $('body').addClass('view-timesheet-entry-edit')
            //   $('body').removeClass('view-processing')
            if(totalSatusSelected == true){
					changeBodyClass('view-timesheets filter-new filter-submitted filter-rejected filter-approved view-processing', 'view-timesheet-entry-status filter-' + status.toLowerCase())
				}else{
					changeBodyClass('view-processing', 'view-timesheet-entry-edit')
				}
        }).catch(function (error) {
            logToConsole(`error: error submiting the TSE: ${error}`)
        })
}
// This function will save multiple new Timesheet Entries
function saveTimesheetMultipleEntry(context, tseSubmit = false) {
    if($('.inline-timesheet-entry-table .trow:last').find('.add-inline-btn').is(":disabled") === true){
        if(!areMandatoryFilledAddedRow()){
            showDialogueBox('errorsavingInline')
            return
        }
        $('#overlay').addClass('active')
        $('#confirmation-inline-ts-save').addClass('active')
        return
    }
    const timesheetEntry = $('.inline-timesheet-entry-table .trow.tbody')
    submitMultipleTS(timesheetEntry,context,tseSubmit);
}
function confirmMultipleSave() {
    $('#overlay').removeClass('active')
    $('#confirmation-inline-ts-save').removeClass('active')
    const timesheetEntry = $('.inline-timesheet-entry-table .trow.tbody.taddedrow')    
    submitMultipleTS(timesheetEntry, context="create", tseSubmit = false);
}
//inline save
async function submitMultipleTS(timesheetEntry, context, tseSubmit = false) {
    const promises = [];
    var tsewoid = ""
	var tsewoliid = ""
	var tsesaid = ""
    var getObjectStatus = timesheetEntry.parents('.inline-timesheet-entry-table').hasClass('work-order-related')   
    var inlineEntry = $('.inline-form-container')
    tsewoid = inlineEntry.attr('data-tsewoid') ? inlineEntry.attr('data-tsewoid'): ""
    tsewoliid = inlineEntry.attr('data-tsewoliid') ? inlineEntry.attr('data-tsewoliid') : ""
	tsesaid = inlineEntry.attr('data-tsesaid') ? inlineEntry.attr('data-tsesaid') : ""
    tsEntrysaid = inlineEntry.attr('data-tsesaid') ? inlineEntry.attr('data-tsesaid') : ""
    var isRejected = inlineEntry.hasClass('rejected')    
    if(inlineEntry.hasClass('clone')) {
          const cloneDate = $('.timesheet-entry-date input', timesheetEntry[0]).attr('value')
          inlineEntry.attr('data-date', cloneDate)         
    }
     const timesheetId = $('.timesheet.active').attr('data-sfid')
     for(let i = 0; i < timesheetEntry.length; i++) {
        let rowEle = timesheetEntry[i]
        const request = {
            'type': '',
            'object': 'TimeSheetEntry',
            'data': {
                'RecordTypeId': '', // if page launch context is Non-work-order-related then "0120O000000ksqHQAQ" else "0120O000000ksqIQAQ"
                'TimeSheetId': timesheetId, // sfid of active Timesheet
                'StartTime': "", // provide the time in UTC format
                'EndTime': "", // provide the time in UTC format
                'DurationInMinutes': "",
                'FSLABB_ServiceResourceUser_ref__c': userId, // provide user id in case user is working offline
                'IsDeleted': 'FALSE' // Provide IsDeleted in case user is working offline
                // Do not set as either not used or auto-populated at Salesforce end            "FSLABB_Country__c": userCountry // we use the user's Country
            }
        }
        const date = $('.timesheet-entry-date input', rowEle).attr('value')
        const startTime = $('.timesheet-entry-start-time input', rowEle).val()
        const endTime = $('.timesheet-entry-end-time input', rowEle).val()
        // parse Local Time (the time offset will come from the user's device configuration)
        const startMoment = moment(`${date}T${startTime}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
        const endMoment = moment(`${date}T${endTime}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
        const durationInMinutes = endMoment.diff(startMoment, 'minutes') + ''
        request.data.StartTime = startMoment.utc().format();
        request.data.EndTime = endMoment.utc().format();            
        request.data.DurationInMinutes = durationInMinutes
    
     
 
     // if create new or clone set the Status to New and the request type to 'create'
     if (context != 'update') {
         request.data.Status = 'New'
         request.type = 'create'
         // else set the request type to 'update' and add Id to data;
     } else {
         request.type = 'update'
         // if timesheet status is rejected and got updated its status changed it to new / M_024
         if (isRejected) {
             if (tseSubmit == true) {
                 request.data.Status = 'Submitted'
             }
             else {
                 request.data.Status = 'New'
             }
         }
         request.data.Id = inlineEntry.attr('data-sfid')
     }
 
     if (tseSubmit == true || isRejected == true) {
         if (getObjectStatus) {
             request.data.RecordTypeId = workOrderRelated
             request.data.FSLABB_IsNonWorkRelated__c = 'FALSE' // This value will be overwritten if in Pulsar and online
             request.data.FSLABB_ServiceAppointment_ref__c = tsesaid // Set FSLABB_ServiceAppointment_ref__c if WO/WOLI related
         } else {
             request.data.RecordTypeId = nonWorkOrderRelated
             request.data.FSLABB_IsNonWorkRelated__c = 'TRUE' // This value will be overwritten if in Pulsar and online
         }
 
         // Set the workOrderId if applicable
         if (tsewoid) {
             request.data.WorkOrderId = tsewoid // Only need to set this if workOrderId not null
         }
 
         // Set the workOrderLineItemId if applicable
         if (tsewoliid) {
             request.data.WorkOrderLineItemId = tsewoliid // Only need to set this if workOrderLineItemId not null
         }
     } else if (getObjectStatus && ((objectType == '') || (objectType == null) || (objectType == undefined))) {
    
        if (getObjectStatus) {
            request.data.RecordTypeId = workOrderRelated
            request.data.FSLABB_IsNonWorkRelated__c = 'FALSE' // This value will be overwritten if in Pulsar and online
            request.data.FSLABB_ServiceAppointment_ref__c = tsEntrysaid // Set FSLABB_ServiceAppointment_ref__c if WO/WOLI related
        } else {
            request.data.RecordTypeId = nonWorkOrderRelated
            request.data.FSLABB_IsNonWorkRelated__c = 'TRUE' // This value will be overwritten if in Pulsar and online
        }

        // Set the workOrderId if applicable
        if (tsewoid) {
            request.data.WorkOrderId = tsewoid // Only need to set this if workOrderId not null
    }

        // Set the workOrderLineItemId if applicable
        if (tsewoliid) {
            request.data.WorkOrderLineItemId = tsewoliid // Only need to set this if workOrderLineItemId not null
        }
    } else if (!getObjectStatus && objectType != null && ((objectType.toLowerCase() == 'workorder') || (objectType.toLowerCase() == 'workorderlineitem'))) {
            if (getObjectStatus) {
                request.data.RecordTypeId = workOrderRelated
                request.data.FSLABB_IsNonWorkRelated__c = 'FALSE' // This value will be overwritten if in Pulsar and online
                request.data.FSLABB_ServiceAppointment_ref__c = tsEntrysaid // Set FSLABB_ServiceAppointment_ref__c if WO/WOLI related
            } else {
                request.data.RecordTypeId = nonWorkOrderRelated
                request.data.FSLABB_IsNonWorkRelated__c = 'TRUE' // This value will be overwritten if in Pulsar and online
            }
            // Set the workOrderId if applicable
            if (tsewoid) {
                request.data.WorkOrderId = tsewoid // Only need to set this if workOrderId not null
            }
            // Set the workOrderLineItemId if applicable
            if (tsewoliid) {
                request.data.WorkOrderLineItemId = tsewoliid // Only need to set this if workOrderLineItemId not null
            }
        } else {
         if (objectType) {
             request.data.RecordTypeId = workOrderRelated
             request.data.FSLABB_IsNonWorkRelated__c = 'FALSE' // This value will be overwritten if in Pulsar and online
             request.data.FSLABB_ServiceAppointment_ref__c = saId // Set FSLABB_ServiceAppointment_ref__c if WO/WOLI related
         } else {
             request.data.RecordTypeId = nonWorkOrderRelated
             request.data.FSLABB_IsNonWorkRelated__c = 'TRUE' // This value will be overwritten if in Pulsar and online
         }
 
         // Set the workOrderId if applicable
if (context == 'create') {
         if (workOrderId) {
             request.data.WorkOrderId = workOrderId // Only need to set this if workOrderId not null
         }
 
         // Set the workOrderLineItemId if applicable
         if (workOrderLineItemId) {
             request.data.WorkOrderLineItemId = workOrderLineItemId // Only need to set this if workOrderLineItemId not null
}
        } else {
                  if (tsewoid && tsEntrysaid) {
                       request.data.WorkOrderId = tsewoid // Only need to set this if workOrderId not null                }
                       request.data.FSLABB_ServiceAppointment_ref__c = tsEntrysaid
                   }
                   // Set the workOrderLineItemId if applicable
                   if (tsewoliid && tsEntrysaid) {
                       request.data.WorkOrderLineItemId = tsewoliid // Only need to set this if workOrderLineItemId not null
                       request.data.FSLABB_ServiceAppointment_ref__c = tsEntrysaid
                   }
         }
     }
 
 
     // Set other variables
     // extract field name
     const getFieldName = element => {
         const apiName = element.attr('data-sfAPI')
         // common case
         if (!element.hasClass('lookup')) return apiName
         // handle special cases of inconsistent lookup naming
         const lookupName = {
             // 'FSLABB_ActivityType': 'FSLABB_ActivityType__c',
             'WorkOrderLineItem': 'WorkOrderLineItemId',
             'FSLABB_SD_Sales_Order_Line_Item__c': 'FSLABB_SD_Sales_Order_Line_Item__c'
         }
         return apiName in lookupName ? lookupName[apiName] : `${apiName}_ref__c`
     }
 
     // extract field value
     const getFieldValue = element => {
         const field = $('input, textarea', element)
         if (field.hasClass('lookup') || field.hasClass('picklist')) {
             return field.attr('data-id')
         } else if (field.hasClass('checkbox')) {
             return field.is(':checked') ? 'TRUE' : 'FALSE'
         } else {
             return field.val()
         }
     }
 
     // check wether we want to include this field or not
     const validField = (fieldName, fieldValue, element) => {
         const field = $('input, textarea', element)
         const constraints = [
             () => fieldName === 'FSLABB_Reject_Reason__c', // this field is never included
             () => field.hasClass('lookup') && !fieldValue, // a lookup with no value is not included
             //() => fieldName === 'FSLABB_UnproductiveCode__c' && objectId // can't be an UnproductiveCode field on WO/WOLI
         ]
         return !constraints.find(constraint => constraint())
     }
 
     // Get all other field containers (divs with data-sfAPI set) in current TSE and for each
     $('div[data-sfAPI]', rowEle).each((index, content) => {
         const fieldContainer = $(content)
         const fieldName = getFieldName(fieldContainer)
         const fieldValue = getFieldValue(fieldContainer)
         if (validField(fieldName, fieldValue, fieldContainer)) {
             request.data[fieldName] = fieldValue
         }
     })
 
     // Show the loading screen while this all gets processed
     //  $('body').removeClass('view-timesheet-entry-edit')
     // $('body').addClass('view-processing')
     //changeBodyClass('view-timesheet-entry-edit', 'view-processing')
     // logToConsole(`request: ${JSON.stringify(request)}`)
 
     request.data['FSLABB_TimeEntryType__c'] = 'Allowance'
 
 
     if (request.data['FSLABB_Allowance_Type_ref__c'] != '') {
 
         var isDataCurrency = $("div#FSLABB_Allowance_Type table.lookup-table tr[data-sfid='" + request.data['FSLABB_Allowance_Type_ref__c'] + "']").attr("data-iscurrency")
 
         if (!isDataCurrency || isDataCurrency == undefined || isDataCurrency == 'FALSE') {
             request.data['FSLABB_Allowance_Amount_Currency__c'] = ''
         }
     }
     showProcessLoader()
     const requestTSE = {
         'type': request.type,
         'data': request.data,
         'object': request.object,
     }
     logToConsole('**requste save TSE::'+JSON.stringify(requestTSE))
     // Return promise of pulsar result
     if (inPulsar) {
            let promise = getUpdatedTSEdata(requestTSE, context, date, startTime, inlineEntry, tseSubmit)
            logToConsole('**in for promise value : '+promise +'::'+JSON.stringify(promise))
            promises.push(promise);
            logToConsole('**in for promises value : '+promise +'::'+JSON.stringify(promises))
         }
     }
     Promise.all(promises)
         .then(() => {
             hideProcessLoader()
             logToConsole('**iteration completed ')
             hideInlineTSE()
             inlineTsEntry = true;
             dayInlineTSClick = false
             logToConsole('**promises success')            
         })
         .catch((e) => {
             // handle errors here
             logToConsole(`failed promise multiple TSE:: ${e}`)
         });
  
}
function getUpdatedTSEdata(requestTSE, context, date, startTime, inlineEntry, tseSubmit) {
    return new Promise(function(resolve, reject) {
    //pulsar.bridge.send(requestTSE, function (result) {
    callJSAPI(requestTSE.type, requestTSE.data, requestTSE.object).then(function (result) {
        if (result != undefined && result != null && result != "error") {
            logToConsole('**TSE result : ' + result + '::' + JSON.stringify(result))
            const recordId = (context === 'update') ? inlineEntry.attr('data-sfid') : result
            const newRequest = {
                'type': 'select',
                'object': 'TimeSheetEntry',
                'data': {
                    'query': `SELECT TSE.Id AS Id,
                                TSE.Description AS Description,
                                TSE.DurationInMinutes AS DurationInMinutes,
                                TSE.EndTime AS EndTime,
                                TSE.TimeSheetEntryNumber AS TimeSheetEntryNumber,
                                TSE.FSLABB_ServiceAppointment_ref__c AS FSLABB_ServiceAppointment_ref__c,
                                TSE.FSLABB_ServiceAppointment_Name__c AS FSLABB_ServiceAppointment_Name__c,
                                TSE.FSLABB_Absence_Type_ref__c AS FSLABB_Absence_Type_ref__c,
                                TSE.FSLABB_Absence_Type_Name__c AS FSLABB_Absence_Type_Name__c,
                                TSE.FSLABB_ActivityType__c AS FSLABB_ActivityType_ref__c,
                                TSE.FSLABB_ActivityType_Name__c AS FSLABB_ActivityType_Name__c,
                                TSE.FSLABB_Allowance_Amount__c AS FSLABB_Allowance_Amount__c,
                                TSE.FSLABB_Allowance_Amount_Currency__c AS FSLABB_Allowance_Amount_Currency__c,
                                TSE.FSLABB_Allowance_Amount_Currency_Name__c AS FSLABB_Allowance_Amount_Currency_Name__c,
                                TSE.FSLABB_Allowance_Type_ref__c AS FSLABB_Allowance_Type_ref__c,
                                TSE.FSLABB_Allowance_Type_Name__c AS FSLABB_Allowance_Type_Name__c,
                                TSE.FSLABB_Bank_Time__c AS FSLABB_Bank_Time__c,
                                TSE.FSLABB_Category_ref__c AS FSLABB_Category_ref__c,
                                TSE.FSLABB_Category_Name__c AS FSLABB_Category_Name__c,
                                TSE.FSLABB_CostCenter__c AS FSLABB_CostCenter__c,
                                TSE.FSLABB_IsNonWorkRelated__c AS FSLABB_IsNonWorkRelated__c,
                                TSE.FSLABB_OtherOrderType__c AS FSLABB_OtherOrderType__c,
                                TSE.FSLABB_OtherOrderType_Name__c AS FSLABB_OtherOrderType_Name__c,
                                TSE.FSLABB_OvertimeCompensationAllowance__c AS FSLABB_OvertimeCompensationAllowance__c,
                                TSE.FSLABB_OvertimeCompensationAllowance_Nam__c AS FSLABB_OvertimeCompensationAllowance_Name__c,
                                TSE.FSLABB_Reject_Reason__c AS FSLABB_Reject_Reason__c,
                                TSE.FSLABB_TimeEntryType__c AS FSLABB_TimeEntryType__c,
                                TSE.FSLABB_Country__c AS FSLABB_Country__c,
                                TSE.FSLABB_TimeEntryType_Name__c AS FSLABB_TimeEntryType_Name__c,
                                TSE.FSLABB_UnproductiveCode__c AS FSLABB_UnproductiveCode__c,
                                TSE.FSLABB_UnproductiveCode_Name__c AS FSLABB_UnproductiveCode_Name__c,
                                TSE.FSLABB_Wage_Type_ref__c AS FSLABB_Wage_Type_ref__c,
                                TSE.FSLABB_Wage_Type_Name__c AS FSLABB_Wage_Type_Name__c,
                                TSE.FSLABB_SD_Sales_Order_Line_Item__c AS FSLABB_SD_Sales_Order_Line_Item__c,
                                TSE.FSLABB_SAPId__c AS FSLABB_SAPId__c,
                                TSE.FSLABB_SAPOperation__c AS FSLABB_SAPOperation__c,
                                TSE.StartTime AS StartTime,
                                TSE.Status AS Status,
                                TSE.Subject AS Subject,
                                TSE.TimeSheetId AS TimeSheetId,
                                TSE.WorkOrderId AS WorkOrderId,
                                TSE.WorkOrderLineItemId AS WorkOrderLineItemId,
                                TSE.LastModifiedDate AS LastModifiedDate,
                                TSE.FSLABB_Allowance__c,
                                WOLI.Subject AS WorkOrderLineItem_Name__c,
                                WO.WorkOrderNumber AS WorkOrderNumber,
                                AC.Name AS AccountName,
                                LO.Name AS SiteName
                            FROM TimeSheetEntry TSE 
                                Left Join WorkOrderLineItem WOLI ON WOLI.Id=TSE.WorkOrderLineItemId
                                Left Join WorkOrder WO on WO.Id=TSE.WorkOrderId
                                Left Join Account AC on AC.Id=WO.AccountId
                                Left Join Location LO on LO.Id=WO.FSLABB_Site__c
                              WHERE TSE.Id = '${recordId}' and  TSE.FSLABB_Allowance__c = 'TRUE'
                              LIMIT 1`
                }
            }

                    // if offline we simulate this by passing the whole result in the data which then gets sent straight back //REMOVE ON PRODUCTION
                    if (!inPulsar) {
                        logToConsole('not in pulsar')
                        newRequest.data[0] = result
                        newParentTSEs.push(result);
                    }

                    // Get the required data from the new TSE
                    callJSAPI(newRequest.type, newRequest.data, newRequest.object).then((readResult) => {
                        logToConsole(`readResultreadResult :: ${JSON.stringify(readResult)}`);
                        if (inlineEntry.hasClass('rejected')) {
                            if (tseSubmit == true) {
                                readResult[0].Status = "Submitted"
                            }
                        }
                        buildTimesheetEntry(readResult[0]).then(() => {
                            const parentDay = inlineEntry.closest('.day')
                        if ((parentDay.attr('data-date') == '') || (parentDay.attr('data-date') == undefined)) { // is this a dummy day container
                            parentDay.removeClass('active')
                            parentDay.remove() // Remove the dummy day container
                        } else {
                            ///inlineEntry.remove() // Remove the editable temporary TSE
                            var tID = inlineEntry.attr('data-sfid')
                            if(tID){
                                inlineEntry.parents('.day-timesheet-entry-container').find(`.timesheet-entry[data-sfid = "${tID}"]`)[0].remove()
                            }
                        }

                            // Sort the timesheet entries for this timesheet onlym
                            sortTimesheetEntries(true)
                            // Update the Days Totals for this timesheet only
                            updateTimesheetTotals(true)
                                                        // Update the heights of charts, etc
                            chartHeightsAndInitialize(true)
                            // Remove active from the current day and set the target date to be active
                            $('div.day.active').removeClass('active')
                            if (launchViewContext != 'view-timesheets') {
                                $(`div.day[data-date=${date}]`).addClass('active')
                            }
                           // updateTimesheetEntryData()
                            // Show the screen again
                            // Get the number of minutes that have passed since 00:00 to the time of now
                            const currentTimeInMinutes = moment.duration(startTime).asMinutes()
                            // Get half the height of the active day calendar content container
                            const heightOffset = $('div.day.active div.day-calendar-content').height() / 2
                            // This will scroll so that the current time is roughly in the middle
                            $('div.day.active div.day-calendar-content').scrollTop(currentTimeInMinutes - heightOffset)
                            // set scroll attribute if not in view-day
                            $('div.day.active').attr('data-scroll', currentTimeInMinutes - heightOffset)
                            var auto_ovt = country[userCountry]['auto_ovt'];
                            // if (auto_ovt === 'TRUE' && objectId) {
                           
             
                   // logToConsole("***requestTSE.data.FSLABB_SAPId__c => " + requestTSE.data.FSLABB_SAPId__c)
                    if(requestTSE.data.FSLABB_SAPId__c && requestTSE.data.FSLABB_SAPId__c != '' && requestTSE.data.RecordTypeId && requestTSE.data.RecordTypeId == nonWorkOrderRelated) {
                        var sapDocumentNumber = requestTSE.data.FSLABB_SAPId__c
                        var sapList = []
                        if (userSAPList != null && userSAPList != '') {
                            sapList = userSAPList.split(',')
                            var sapNumIndex = sapList.indexOf(sapDocumentNumber)
                            if(sapNumIndex == -1) {
                                if(sapList.length < 10) {
                                    sapList.unshift(sapDocumentNumber)
                                } else {
                                    sapList.splice(9, 1)
                                    sapList.unshift(sapDocumentNumber)
                                }
                            } else {
                                var shifted = sapList.splice(sapNumIndex, 1)
                                sapList.unshift(shifted[0])
                            }
                        } else {
                            sapList.push(sapDocumentNumber)
                        }
                        var sapNumberString = sapList.join()
                       
                        var queryData = {
                            'query': `Update User set FSLABB_Latest_list_of_SAP_Order_Number__c = '${sapNumberString}' Where Id = '${userId}'`
                        }
                        callJSAPI('updateQuery', queryData, 'User').then(function(result) {
                            userSAPList = sapNumberString
                            logToConsole("***modified userSAPList => " + JSON.stringify(userSAPList))
                            logToConsole("FSLABB_Latest_list_of_SAP_Order_Number__c updated successfully")
                        }).catch(function(error) {
                            logToConsole("FSLABB_Latest_list_of_SAP_Order_Number__c update failure" + error)
                            logToScreen(error)
                        })
                    }else {
                                //hideProcessLoader()
                    }
                    logToConsole(`resolve promise multiple TSE`)
                    resolve()
                        })
                        // if ($('body').hasClass('view-day')) {
                        //     changeActionIcons()
                        // } else {
                        //     changeActionIcons(true)
                        // }
                    }).catch(function(error) {
                        logToConsole(`error: error queryting TSE: ${error}`)
                    })
                } else {
                    hideProcessLoader()                       
                }
            })
        },
        function() { // on reject, close loading data and let user fix validation error returned
            showDialogueBox('errorsaving')
        }).catch(function(error) {
        reject('error while saving TSE')
        logToConsole(`error: error submiting the TSE: ${error}`)
    })

}

function previousTimesheet() { // Deactivates current timesheet and activates previous timesheet
    // Get JQuery object of all timesheets & loop through it
    var timesheets = $('#timesheets-container div.timesheet')
    timesheets.each(function (i, dom) {
        // Does the timesheet have the class attribute of active?
        var isActive = $(this).hasClass('active')

        // Is the timesheet active?
        if (isActive) {
            // If it is not the first timesheet deactivate current timesheet & activate previous timesheet
            if (i != 0) {
                $(this).removeClass('active')
                timesheets.eq(i - 1).addClass('active')
                scrollToToday()
            }
            return false // Breaks jquery loop
        }
    })
}

function nextTimesheet() { // Deactivates current timesheet and activates previous timesheet
    // Get JQuery object of all timesheets & loop through it
    var timesheets = $('#timesheets-container div.timesheet')
    timesheets.each(function (i, dom) {
        // Does the timesheet have the class attribute of active?
        var isActive = $(this).hasClass('active')

        // Is timesheet active?
        if (isActive) {
            // If it is not the last timesheet deactivate current timesheet & activate next timesheet
            if (timesheets.length != i + 1) {
                $(this).removeClass('active')
                timesheets.eq(i + 1).addClass('active')
                scrollToToday()
            }
            return false // Breaks jquery loop
        }
    })
}
function changeActionIcons(totalView) {
    let allTSE = $('div.timesheet.active div.timesheet-entry');
    allTSE.each(function(index, ele){   
        if(totalView == true){
            $('div.icon-actions-container div.inline-icons-wraper', ele).removeClass('global-hidden')
            $('div.icon-actions-container a.icon-actions', ele).addClass('global-hidden')
            return;
        }   
        if(Number(ele.style.height.split('px')[0]) < 20) {
            $('div.icon-actions-container div.inline-icons-wraper', ele).addClass('global-hidden')
            $('div.icon-actions-container a.icon-actions', ele).removeClass('global-hidden')
        } else {
            $('div.icon-actions-container div.inline-icons-wraper', ele).removeClass('global-hidden')
            $('div.icon-actions-container a.icon-actions', ele).addClass('global-hidden')
        }
    })
}
// Code for 49900
function changeOnDayView() {
    hideAllWeeksButton();
    $(".submit-all").text("Submit This Day");
}

function hideAllWeeksButton() {
    if ($('div.day.active')) {
        $(".submit-all-weeks").hide();
    }
}
function checkCloneStatus() {
    $('.clone-btn').prop('disabled', true);
    if ($('div.day.active').find('.timesheet-entry').length > 0) {
        $(".clone-btn").removeAttr("disabled");
    }
}

function viewDay() {
    $('div.day.active').removeClass('active')
    $(this).parent().addClass('active')
    //$('body').removeClass('view-timesheets').addClass('view-day')
    changeBodyClass('view-timesheets', 'view-day')
	totalSatusSelected = false
	if ($('body').hasClass('view-timesheet-entry-status filter-' + selectedStatus)){
		$(this).removeClass('view-timesheet-entry-status filter-' + selectedStatus)
	}
    // Get the number of minutes that have passed since 00:00 to the time of now
    const currentTimeInMinutes = moment().diff(moment().startOf('day'), 'minutes')
    // Get half the height of the active day calendar content container
    const heightOffset = $('.day.active .day-calendar-content').height() / 2
    // This will scroll so that the current time is roughly in the middle
    $('.day.active .day-calendar-content').scrollTop(currentTimeInMinutes - heightOffset)
    if ($('div.timesheet.active div.day.active div.timesheet-entry.rejected').hasClass('editable')) {
        //var tseDataId = $('.timesheet-entry.rejected').attr('data-sfid')
        var tsewoid = $('div.timesheet.active div.day.active div.timesheet-entry.rejected').attr('data-tsewoid')
        if (tsewoid != workOrderId) {
            $('div.timesheet.active div.day.active div.timesheet-entry.rejected').removeClass('editable')
        }
    }
    if ((objectType == '') || (objectType == null) || (objectType == undefined)) {
        if ($('div.timesheet.active div.day.active div.timesheet-entry.rejected').hasClass('non-work-order-related')) {
            $('div.timesheet.active div.day.active div.timesheet-entry.rejected').addClass('editable')
        }
    }
    changeOnDayView();//49900
    checkCloneStatus();
}

function showDayView() {
    if ($('div.timesheet.active div.day.active div.timesheet-entry.rejected').hasClass('editable')) {
        //var tseDataId = $('.timesheet-entry.rejected').attr('data-sfid')
        var tsewoid = $('div.timesheet.active div.day.active div.timesheet-entry.rejected').attr('data-tsewoid')
        if (tsewoid != workOrderId) {
            $('div.timesheet.active div.day.active div.timesheet-entry.rejected').removeClass('editable')
        }
    }
    if ((objectType == '') || (objectType == null) || (objectType == undefined)) {
        if ($('div.timesheet.active div.day.active div.timesheet-entry.rejected').hasClass('non-work-order-related')) {
            $('div.timesheet.active div.day.active div.timesheet-entry.rejected').addClass('editable')
        }
    }
    // $('body').removeClass('view-day-list').addClass('view-day')
    changeBodyClass('view-day-list', 'view-day')
    $('.day.active .day-calendar-content').scrollTop($('.day.active').attr('data-scroll')) // scrolls back to previous position so we can get back to it
}

function showTimesheetView() {
    if ($('.inline-form-container:visible:not(.view)').length > 0 ) {
        showDiscardInlineTspopup("showTimeSheet");
        // dayInlineTSClick = true;
    }
    else{
    // $('body').removeClass('view-day-list view-day view-timesheet-entry-status filter-new filter-submitted filter-rejected filter-approved').addClass('view-timesheets')
    changeBodyClass('view-day-list view-day view-timesheet-entry-status filter-new filter-submitted filter-rejected filter-approved', 'view-timesheets')
    $('.day.active').removeClass('active')
			window.location.reload()
	    //Code for 49900
    $(".submit-all").text("Submit This Week");
    $(".submit-all-weeks").show();
}
}

function showTimesheetEntryStatusView(status) {
	selectedStatus = status
    if (status == 'Rejected') {
        $('.timesheet-entry.rejected').addClass('editable')
    }
    var correctTimesheet = $('.timesheet.active')
    $('.title-status', correctTimesheet).text(status)
    if(status == "Total"){
    	totalSatusSelected = true
    	$('.icon-add-timesheet-entry.total-status-add-icon').removeClass('global-hidden')
	}else{
		totalSatusSelected = false
		$('.icon-add-timesheet-entry.total-status-add-icon').addClass('global-hidden')
	}
   // $('body').removeClass('view-timesheets filter-new filter-submitted filter-rejected filter-approved').addClass('view-timesheet-entry-status filter-' + status.toLowerCase())
   changeBodyClass('view-timesheets filter-new filter-submitted filter-rejected filter-approved', 'view-timesheet-entry-status filter-' + status.toLowerCase())
   //Code for 49900
    if (status !== "Total") {
        $('.submit-all-weeks').hide();
    }
}

function previousDay() {
    var current = $('.day.active')
    // Get the scroll position for the current day
    var currentScrollPosition = $('.day-calendar-content', current).scrollTop()
    var previous = current.prev()

    // If at the beginning of timesheet you won't find a prev day
    if ($(previous).length === 0) {
        // Go to previous timesheet entry & get last day
        previousTimesheet()
        previous = $('.timesheet.active .day').last()
    }
    current.removeClass('active')
    previous.addClass('active')

    // Apply the scroll position to the new day
    $('.day-calendar-content', previous).scrollTop(currentScrollPosition)
    checkCloneStatus();
    //Code for 49900
    changeOnDayView();
}

function nextDay() {
    var current = $('.day.active')
    // Get the scroll position for the current day
    var currentScrollPosition = $('.day-calendar-content', current).scrollTop()
    var next = current.next()

    // If at the end of timesheet you won't find a next day
    if ($(next).length === 0) {
        // Go to next timesheet entry & get first day
        nextTimesheet()
        next = $('.timesheet.active .day').first()
    }

    current.removeClass('active')
    next.addClass('active')

    // Apply the scroll position to the new day
    $('.day-calendar-content', next).scrollTop(currentScrollPosition)
    checkCloneStatus();
    //Code for 49900
    changeOnDayView();
}

function scrollDayDown() {
    var elementToScroll = $('.day-calendar-content', '.day.active')
    var currentPos = elementToScroll.scrollTop()
    newPos = currentPos - 60
    elementToScroll.scrollTop(newPos)
}

function scrollDayUp() {
    var elementToScroll = $('.day-calendar-content', '.day.active')
    var currentPos = elementToScroll.scrollTop()
    newPos = currentPos + 60
    elementToScroll.scrollTop(newPos)
}

// timesheet entry Back icon and Close icon functionality
function timesheetEntryBackClose(action) {
    if ($('body').hasClass('view-timesheet-entry')) {
        timesheetEntryBackCloseActions(action)
        return
    }
    var isDataDirty = isActiveTimesheetEntryDataDirty()
    logToConsole('Data Dirty ' + isDataDirty)
    if (isDataDirty) {
        $('#unsaved-warning-continue').removeAttr('onclick').attr('onClick', 'timesheetEntryBackCloseActions("' + action + '");')
        //  $('#overlay').addClass('active')
        //  $('#unsaved-warning').addClass('active')
        showDialogueBox('unsaved-warning')
    } else {
        timesheetEntryBackCloseActions(action)
    }
}

function timesheetEntryBackCloseActions(action) {
    var timesheetEntry = $('.timesheet-entry.active')
    var viewContext = ''

    if ($(timesheetEntry).hasClass('edit')) {
        viewContext = 'edit'
    } else if ($(timesheetEntry).hasClass('clone')) {
        viewContext = 'clone'
    } else if ($(timesheetEntry).hasClass('create')) {
        viewContext = 'create'
    } else {
        viewContext = 'view'
    }

    switch (viewContext) {
        case 'edit':
            timesheetEntryDiscardChanges(timesheetEntry)
            break
        case 'clone':
            timesheetEntryDestroyClone(timesheetEntry)
            break
        case 'create':
            timesheetEntryDestroyCreate(timesheetEntry)
            break
        default:
            var date = $('.timesheet.active .day.active').attr('data-date') // if view then reset date
            $('.timesheet.active .day.active .timesheet-entry.active .timesheet-entry-date .value').text(date)
    }

    closePopUps()

    $(timesheetEntry).removeClass('active') // remove active class if still exists
    $(timesheetEntry).removeClass(viewContext) // remove viewContext class
	if(totalSatusSelected == true){
		//$('body').removeClass('view-timesheet-entry view-timesheet-entry-edit').addClass('view-timesheet-entry-status filter-' + selectedStatus) // return to launch view
		changeBodyClass('view-timesheet-entry view-timesheet-entry-edit', 'view-timesheet-entry-status filter-' + selectedStatus)
	}else{
		// $('body').removeClass('view-timesheet-entry view-timesheet-entry-edit').addClass(launchViewContext) // return to launch view
		
		changeBodyClass('view-timesheet-entry view-timesheet-entry-edit', launchViewContext)
    	$('div.day.active div.day-calendar-content').scrollTop($('.timesheet.active .day.active').attr('data-scroll'))
	
	}

    if (action == 'close') {
		if(totalSatusSelected != true){
			returnToLaunchPage(true)
		}
    }
}

function timesheetEntryDiscardChanges(timesheetEntry) {
    $('input, textarea', timesheetEntry).each(function (index, element) {
        if (!$(element).hasClass('datepicker')) {
            $(element).val($(element).siblings('.value').text()) // revert values to original
            $(element).attr('data-id', $(element).siblings('.value').attr('data-id')) // revert data to values
        } else { // If datepicker then set values from TSE data-date
            var date = timesheetEntry.attr('data-date')
            $(element).attr('value', date)
            $(element).val(setLocaleDateString(date))
        }
    })
}

function timesheetEntryDestroyClone(timesheetEntry) {
    $(timesheetEntry).remove()
}

function timesheetEntryDestroyCreate(timesheetEntry) {
    var parentDay = $(timesheetEntry).closest('.day')
    if (parentDay.attr('data-date') == '') { // is this a dummy day container
        parentDay.remove()
    } else {
        $(timesheetEntry).remove()
    }
}

// Helper function to check if data dirty
function isActiveTimesheetEntryDataDirty() {
    var timesheetEntry = $('.timesheet-entry.active')
    var isDirty = false
    $('input, textarea', timesheetEntry).each(function (index, element) {
        var originalData
        if ($(element).hasClass('datepicker')) { // If datepicker get currentData from input attr value and originalData from timesheetEntry data-day
            var currentData = $(element).attr('value')
            var originalData = timesheetEntry.attr('data-date')
        } else { // else get current data from input val and originalData from the div.value
            var currentData = $(element).val()
            var originalData = $(element).siblings('.value').text()
        }

        var isElementDirty = (currentData != originalData)
        // isDirty = (isDirty || isElementDirty)
        if (isElementDirty) {
            isDirty = true
            return false
        }
    })
    return isDirty
}

// Helper function to check if mandatory fields have data
function areMandatoryFilled() {
    const timesheetEntry = $('.timesheet-entry.active')
    let tsEntryEle = inlineTsEntry ? timesheetEntry.parents('.inline-timesheet-entry-table') : timesheetEntry
    let allMandatoryFilled = true
    let allElements = [];
    if (tsEntryEle.hasClass('work-order-related')) {
        allElements = $('.required, .required-on-work-order-related', timesheetEntry).not(':hidden').not(':disabled')
    } else if (tsEntryEle.hasClass('non-work-order-related')) {
        allElements = $('.required, .required-on-non-work-order-related', timesheetEntry).not(':hidden').not(':disabled')
    }
    allElements.each(function (index, element) {
        if (!$(element).val()) {
            allMandatoryFilled = false
            return false
        }
    })
    var regexp = /^\d+(\.\d{0,9})?$/;
    numericElements = $('input.number', timesheetEntry).not(':hidden')
    numericElements.each(function (index, element) {
        // console.log(regexp.test($(element).val()));
        if (!$.isNumeric($(element).val()) || !regexp.test($(element).val())) {
            allMandatoryFilled = false;
            return allMandatoryFilled;
        }
    });
    return allMandatoryFilled
}
function areMandatoryFilledAddedRow() {
    const timesheetEntry = $('.timesheet-entry.taddedrow')
    let allMandatoryFilledInline = true
    let allElements = [];
    let tsEntryEle = inlineTsEntry ? timesheetEntry.parents('.inline-timesheet-entry-table') : timesheetEntry
    if (tsEntryEle.hasClass('work-order-related')) {
        allElements = $('.required, .required-on-work-order-related', timesheetEntry).not(':hidden').not(':disabled')
    } else if (tsEntryEle.hasClass('non-work-order-related')) {
        allElements = $('.required, .required-on-non-work-order-related', timesheetEntry).not(':hidden').not(':disabled')
    }
    allElements.each(function(index, element) {
        if (!$(element).val()) {
            allMandatoryFilledInline = false
            return false
        }
    })
    return allMandatoryFilledInline
}

// check if current required value is filled or not
function checkRequiredFilled(ele) {
    if (ele.value) {
        clearTimeout(typingTimer)
        typingTimer = setTimeout(enableDisableButtons, doneTypingInterval)
    } else {
        $('button.next', tsElement).attr('disabled', true)    
        if(inlineTsEntry){ 
            if($('.inline-timesheet-entry-table .trow:last').find('.add-inline-btn').is(":disabled") === false || $('.inline-timesheet-entry-table .trow.tbody').length > 1){
                $('button.inline-save-btn').attr('disabled', false)
            } else {
                $('button.inline-save-btn').attr('disabled', true)
            }
        }
    }
}
function clearValue(ele) {
    $(ele).parents('.timesheet-entry-FSLABB_OtherOrderType__c').find(':input').val('')
    $(ele).parents('.timesheet-entry-FSLABB_OtherOrderType__c').find(':input').removeAttr('data-id')
    showHideFields()
    ///$('input:disabled').removeAttr('data-description')
    closePopUps()
}

function hideInlineTSE() {
    inlineTsEntry = false;
    $(".inline-form-container")[0].style.top = ""
    $(".inline-timesheet-entry-table .trow.taddedrow").remove();
    $(".inline-timesheet-entry-table").find('input, textarea').not("input[name='entry-date']").val('');
    $(".inline-timesheet-entry-table").find("div.trow:last  input.picklist").attr('data-id', "")
    $(".inline-timesheet-entry-table").find("div.trow:last input.lookup").attr('data-id', "")
    $('.inline-form-container').css({ display: 'none' })
    selectedPickUp = ""
    selectedLookUp = ""
    $('.value', '.inline-timesheet-entry-table').each(function () {
        $(this).text('')
        if($(this).attr('data-id')){
            $(this).attr('data-id',"")
        }
    })
    $(".inline-timesheet-entry-table").parents('.day-timesheet-entry-container').find('div.timesheet-entry.active').removeClass('active');
    $(".inline-timesheet-entry-table").find("div.tbody.timesheet-entry").removeClass('timesheet-entry active');
    if ($('body').hasClass("view-timesheet-entry-status")){
        $('.day.active').removeClass('active')
    }
if($(".time-slot .global_create").length>0){
        if($(".time-slot .global_create").attr("style").length>0){
            $(".timesheet.active .day.active .day-calendar-background .time-slot:first").removeAttr("style")
        }
    }
    enableAndDisableIcons()
}
function showInlineTSE() {
    inlineTsEntry = true;
    $('.inline-form-container').css({ display: 'block' });
    $(".inline-timesheet-entry-table").find("div.trow:last").addClass('timesheet-entry active');
}
function getTSEbyTimeSheetId(tsID) {
    var data = {
        'query': `SELECT TSE.Id AS Id,
                    TSE.FSLABB_AdjustedTime__c AS FSLABB_AdjustedTime__c,
                    TSE.FSLABB_ABBOvertimeCategory__c AS FSLABB_ABBOvertimeCategory__c,
                    TSE.Description AS Description,
                    TSE.DurationInMinutes AS DurationInMinutes,
                    TSE.EndTime AS EndTime,
                    TSE.TimeSheetEntryNumber AS TimeSheetEntryNumber,
                    TSE.FSLABB_ServiceAppointment_ref__c AS FSLABB_ServiceAppointment_ref__c,
                    TSE.FSLABB_ServiceAppointment_Name__c AS FSLABB_ServiceAppointment_Name__c,
                    TSE.FSLABB_Absence_Type_ref__c AS FSLABB_Absence_Type_ref__c ,
                    TSE.FSLABB_Absence_Type_Name__c AS FSLABB_Absence_Type_Name__c ,
                    TSE.FSLABB_ActivityType__c AS FSLABB_ActivityType_ref__c,
                    TSE.FSLABB_ActivityType_Name__c AS FSLABB_ActivityType_Name__c,
                    TSE.FSLABB_Allowance_Amount__c AS FSLABB_Allowance_Amount__c,
                    TSE.FSLABB_TK_Actuals_KMS__c AS FSLABB_TK_Actuals_KMS__c,
                    TSE.FSLABB_Allowance_Amount_Currency__c AS FSLABB_Allowance_Amount_Currency__c,
                    TSE.FSLABB_Allowance_Amount_Currency_Name__c AS FSLABB_Allowance_Amount_Currency_Name__c,
                    TSE.FSLABB_Allowance_Type_ref__c AS FSLABB_Allowance_Type_ref__c,
                    TSE.FSLABB_Allowance_Type_Name__c AS FSLABB_Allowance_Type_Name__c,
                    TSE.FSLABB_Bank_Time__c AS FSLABB_Bank_Time__c,
                    TSE.FSLABB_Category_ref__c AS FSLABB_Category_ref__c,
                    TSE.FSLABB_Category_Name__c AS FSLABB_Category_Name__c,
                    TSE.FSLABB_Price__c AS FSLABB_Price__c,
                    TSE.FSLABB_Currency__c AS FSLABB_Currency__c,
                    TSE.FSLABB_Currency_Name__c AS FSLABB_Currency_Name__c,
                    TSE.FSLABB_CostCenter__c AS FSLABB_CostCenter__c,
                    TSE.FSLABB_IsNonWorkRelated__c AS FSLABB_IsNonWorkRelated__c,
                    TSE.FSLABB_OtherOrderType__c AS FSLABB_OtherOrderType__c,
                    TSE.FSLABB_OtherOrderType_Name__c AS FSLABB_OtherOrderType_Name__c,
                    TSE.FSLABB_OvertimeCompensationAllowance__c AS FSLABB_OvertimeCompensationAllowance__c,
                    TSE.FSLABB_OvertimeCompensationAllowance_Nam__c AS FSLABB_OvertimeCompensationAllowance_Name__c,
                    TSE.FSLABB_Reject_Reason__c AS FSLABB_Reject_Reason__c,
                    TSE.FSLABB_TimeEntryType__c AS FSLABB_TimeEntryType__c,
                    TSE.HR_Up__c AS HR_Up__c,
                    TSE.HR_Down__c AS HR_Down__c,
                    TSE.FSLABB_Country__c AS FSLABB_Country__c,
                    TSE.FSLABB_TimeEntryType_Name__c AS FSLABB_TimeEntryType_Name__c,
                    TSE.FSLABB_UnproductiveCode__c AS FSLABB_UnproductiveCode__c,
                    TSE.FSLABB_UnproductiveCode_Name__c AS FSLABB_UnproductiveCode_Name__c,
                    TSE.FSLABB_Wage_Type_ref__c AS FSLABB_Wage_Type_ref__c,
                    TSE.FSLABB_Wage_Type_Name__c AS FSLABB_Wage_Type_Name__c,
                    TSE.FSLABB_SD_Sales_Order_Line_Item__c AS FSLABB_SD_Sales_Order_Line_Item__c,
                    TSE.FSLABB_SAPId__c AS FSLABB_SAPId__c,
                    TSE.FSLABB_SAPOperation__c AS FSLABB_SAPOperation__c,
					TSE.FSLABB_SAP_Element__c AS FSLABB_SAP_Element__c,
                    TSE.StartTime AS StartTime,
                    TSE.Status AS Status,
                    TSE.Subject AS Subject,
                    TSE.TimeSheetId AS TimeSheetId,
                    TSE.WorkOrderId AS WorkOrderId,
                    TSE.WorkOrderLineItemId AS WorkOrderLineItemId,
                    TSE.LastModifiedDate AS LastModifiedDate,
                    TSE.RecordTypeId,
                    TSE.FSLABB_Allowance__c,
                    TSE.FSLABB_Overtime_Success__c,
                    TSE.FSLABB_Allowance_Type_ref__c,
                    TSE.FSLABB_Allowance_Amount__c,
                    TSE.FSLABB_TK_Actuals_KMS__c,
                    TSE.FSLABB_TTTKUP__c,
                    TSE.FSLABB_TTTKDOWN__c,
                    TSE.FSLABB_TK_Master_KMS__c,
                    TSE.FSLABB_TT_Master_Mins__c,
                    TSE.FSLABB_OVT_HR_TSE__c,
                    TSE.FSLABB_CalculatedTSE__c,
                    TSE.FSLABB_Emergency_WO_TSE__c,
                    WOLI.Subject AS WorkOrderLineItem_Name__c,
                    WO.WorkOrderNumber AS WorkOrderNumber,
                    WO.FSLABB_SAP_Document_Type__c AS FSLABB_SAP_Document_Type__c,
                    AC.Name AS AccountName,
                    LO.Name AS SiteName
                FROM TimeSheetEntry TSE
                    Left Join WorkOrderLineItem WOLI ON WOLI.Id=TSE.WorkOrderLineItemId
                    Left Join WorkOrder WO on WO.Id=TSE.WorkOrderId
                    Left Join Account AC on AC.Id=WO.AccountId
                    Left Join Location LO on LO.Id=WO.FSLABB_Site__c
                WHERE TSE.FSLABB_ServiceResourceUser_ref__c = "${userId}" AND TSE.FSLABB_CalculatedTSE__c != 'TRUE' AND TSE.TimeSheetId = "${tsID}"  AND TSE.IsDeleted != 'Deleted' and (TSE.FSLABB_Allowance__c != 'TRUE' or TSE.FSLABB_Allowance__c is null)
                ORDER BY StartTime ASC`
    }
    return callJSAPI('select', data, 'TimeSheetEntry')

}
function showProcessLoader() {
    $("div.process-loader").addClass('active')
    $('button.footer-btn').attr('disabled', 'disabled')
    $("div.action-icon").addClass('disable-click')
    //$(".day-title.header-title").addClass('disable-click')
    //$(".time-slot").addClass('disable-click')
}

function hideProcessLoader() {
    $("div.process-loader").removeClass('active')
    $('button.footer-btn').removeAttr('disabled')
    $("div.action-icon").removeClass('disable-click')
    //$(".day-title.header-title").removeClass('disable-click')
    //$(".time-slot").removeClass('disable-click')
}
// Opens up timesheet-entry-action-slider pop-up and populates it
function openActionSlider(ele) {
    var timesheetEntry = $(ele).closest('.timesheet-entry')

    if ($('.body').hasClass('view-day')) {
        $('.day.active').attr('data-scroll', $('.day.active .day-calendar-content').scrollTop()) // stores current scroll position so we can get back to it
        launchViewContext = 'view-day'
    } else {
        launchViewContext = 'view-day-list'
    }

    var timesheetDataSFID = timesheetEntry.attr('data-sfid')
    $('#timesheet-entry-action-slider').attr('data-sfid', timesheetDataSFID)

    var timesheetDataStart = timesheetEntry.attr('data-start-time')
    $('#timesheet-entry-action-slider').attr('data-start-time', timesheetDataStart)

    var timesheetDataEnd = timesheetEntry.attr('data-end-time')
    $('#timesheet-entry-action-slider').attr('data-end-time', timesheetDataEnd)

    var timesheetDatatsEntry = timesheetEntry.attr('data-ts-entry')
    $('#timesheet-entry-action-slider').attr('data-ts-entry', timesheetDatatsEntry)

    var timesheetSubject = $('div.timesheet-entry-content div.timesheet-entry-subject div.value', timesheetEntry).text()
    $('#timesheet-entry-action-slider div.timesheet-entry-subject div.value').text(timesheetSubject)

    var timesheetStart = $('div.timesheet-entry-content div.timesheet-entry-start-time div.value', timesheetEntry).text()
    $('#timesheet-entry-action-slider div.timesheet-entry-start div.value').text(timesheetStart)

    var timesheetEnd = $('div.timesheet-entry-content div.timesheet-entry-end-time div.value', timesheetEntry).text()
    $('#timesheet-entry-action-slider div.timesheet-entry-end div.value').text(timesheetEnd)

    var timesheetRejection = $('div.timesheet-entry-content div.timesheet-reject-reason div.value', timesheetEntry).text()
    $('#timesheet-entry-action-slider div.timesheet-entry-rejection-reason div.value').text(timesheetRejection)

    var timesheetStatus = ''
    if (timesheetEntry.hasClass('new')) {
        var timesheetStatus = 'New'
    } else if (timesheetEntry.hasClass('submitted')) {
        var timesheetStatus = 'Submitted'
    } else if (timesheetEntry.hasClass('rejected')) {
        var timesheetStatus = 'Rejected'
    } else if (timesheetEntry.hasClass('approved')) {
        var timesheetStatus = 'Approved'
    } else {
        var timesheetStatus = 'No Status'
    }
    $('#timesheet-entry-action-slider').removeClass('new submitted rejected approved').addClass(timesheetStatus.toLowerCase())
    $('#timesheet-entry-action-slider div.timesheet-entry-status').removeClass('new submitted rejected approved').addClass(timesheetStatus.toLowerCase())
    $('#timesheet-entry-action-slider div.timesheet-entry-status div.value').text(timesheetStatus)
    $('#timesheet-entry-action-slider').toggleClass('active')
    $('#overlay').toggleClass('active')
}

// timesheet-entry-action-slider view functionality
function viewTimesheetEntry() {
    // hideInlineTSE()
    var timesheetSliderSFID = $('#timesheet-entry-action-slider').attr('data-sfid')
    var timesheetEntry = $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]')
    var flag = false
    if (timesheetEntry.hasClass('rejected')) {
        var woRelated = $('.timesheet-entry.rejected').hasClass('work-order-related')
        var nonWoRelated = $('.timesheet-entry.rejected').hasClass('non-work-order-related')

        if (objectType == 'WorkOrder' && nonWoRelated) {
            flag = true
            var data = { 'RecordTypeId': nonWorkOrderRelated }
            var unproductiveCodeData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_UnproductiveCode__c')
            return Promise.all([
                unproductiveCodeData.then(function (result) {
                    picklistData.FSLABB_UnproductiveCode__c = result
                    createPicklist('FSLABB_UnproductiveCode__c')
                }).then(function () {
                    getTseWorkOrderId(timesheetSliderSFID)
                    var unproductiveCodeValue = getUnproductiveCode(unproductiveCodeTSE)
                    $('div.timesheet-entry-FSLABB_UnproductiveCode__c input').val(unproductiveCodeValue)
                    $('div.timesheet-entry-FSLABB_UnproductiveCode__c div.value').text(unproductiveCodeValue)


                    $('.title-value', timesheetEntry).text('View Allowance')
                    timesheetEntry.removeClass('view edit clone create').addClass('view')
                    timesheetEntry.addClass('active')

                    // Get the correct day - active day within active timesheet
                    var correctDay = $('.timesheet.active .day.active')

                    // Set the Launch View context
                    if ($('body').hasClass('view-day')) {
                        launchViewContext = 'view-day'
                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
                    } else if ($('body').hasClass('view-day-list')) {
                        launchViewContext = 'view-day-list'
                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
                    } else if ($('body').hasClass('view-timesheet-entry-status')) {
                        var date = timesheetEntry.attr('data-date')
                        correctDay = $(".timesheet.active .day[data-date='" + date + "']")
                        $('.timesheet.active .day.active').removeClass('active')
                        correctDay.addClass('active')
                        launchViewContext = 'view-timesheet-entry-status'
                    }

                    // Check to see what fields need to be hidden/shown
                    // Check if the data has been changed, and enable the save button if so
                    showHideFields()

                    //$('body').removeClass('view-day view-day-list view-timesheet-entry-status').addClass('view-timesheet-entry')
                    changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry')
                    closePopUps()
                })

            ]).catch(function (error) {
                logToScreen(error)
                logToConsole(error)
            })
        }
        if (flag == false) {
            getTseWorkOrderId(timesheetSliderSFID)
            buildPicklistsLookups(true)
        }
    }
    if (flag == false) {
        $('.title-value', timesheetEntry).text('View Allowance')
        timesheetEntry.removeClass('view edit clone create').addClass('view')
        timesheetEntry.addClass('active')

        // Get the correct day - active day within active timesheet
        var correctDay = $('.timesheet.active .day.active')

        // Set the Launch View context
        if ($('body').hasClass('view-day')) {
            launchViewContext = 'view-day'
            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
        } else if ($('body').hasClass('view-day-list')) {
            launchViewContext = 'view-day-list'
            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
        } else if ($('body').hasClass('view-timesheet-entry-status')) {
            var date = timesheetEntry.attr('data-date')
            correctDay = $(".timesheet.active .day[data-date='" + date + "']")
            $('.timesheet.active .day.active').removeClass('active')
            correctDay.addClass('active')
            launchViewContext = 'view-timesheet-entry-status'
        }

        // Check to see what fields need to be hidden/shown
        // Check if the data has been changed, and enable the save button if so
        showHideFields()

        // $('body').removeClass('view-day view-day-list view-timesheet-entry-status').addClass('view-timesheet-entry')
        changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry')
        closePopUps()
    }
}

function getUnproductiveCode(codeId) {
    var codeData = picklistData['FSLABB_UnproductiveCode__c']
    var codeIds = codeData.itemIds
    var codeIndex = codeIds.indexOf(codeId)
    var codeReturnVal = codeData.itemLabels[codeIndex]
    return codeReturnVal
}

// timesheet-entry-action-slider edit functionality
function editTimesheetEntry() {
    //hideInlineTSE()
    var timesheetSliderSFID = $('#timesheet-entry-action-slider').attr('data-sfid')
    var timesheetEntry = $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]')
    var flag = false

    if (timesheetEntry.hasClass('rejected')) {

        var woRelated = timesheetEntry.hasClass('work-order-related')
        var nonWoRelated = timesheetEntry.hasClass('non-work-order-related')

        if (objectType == 'WorkOrder' && nonWoRelated) {
            flag = true
            var data = { 'RecordTypeId': nonWorkOrderRelated }
            var unproductiveCodeData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_UnproductiveCode__c')
            return Promise.all([
                unproductiveCodeData.then(function (result) {
                    picklistData.FSLABB_UnproductiveCode__c = result
                    createPicklist('FSLABB_UnproductiveCode__c')
                }).then(function () {
                    getTseWorkOrderId(timesheetSliderSFID)
                    var unproductiveCodeValue = getUnproductiveCode(unproductiveCodeTSE)
                    $('div.timesheet-entry-FSLABB_UnproductiveCode__c input').val(unproductiveCodeValue)
                    $('.title-value', timesheetEntry).text('Edit Allowance')
                    timesheetEntry.removeClass('view edit clone create').addClass('edit')
                    timesheetEntry.addClass('active')

                    // Get the correct day - active day within active timesheet
                    var correctDay = $('.timesheet.active .day.active')

                    // Set the Launch View context
                    if ($('body').hasClass('view-day')) {
                        launchViewContext = 'view-day'
                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
                    } else if ($('body').hasClass('view-day-list')) {
                        launchViewContext = 'view-day-list'
                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
                    } else if ($('body').hasClass('view-timesheet-entry-status')) {
                        var date = timesheetEntry.attr('data-date')
                        correctDay = $(".timesheet.active .day[data-date='" + date + "']")
                        $('.timesheet.active .day.active').removeClass('active')
                        correctDay.addClass('active')
                        launchViewContext = 'view-timesheet-entry-status'
                    }

                    // Check to see what fields need to be hidden/shown
                    // Check if the data has been changed, and enable the save button if so
                    showHideFields()

                    // Swap body class to view-timesheet-entry-edit and close any popups
                    // $('body').removeClass('view-day view-day-list view-timesheet-entry-status').addClass('view-timesheet-entry-edit')
                    changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
                    closePopUps()

                    // Focus on subject field
                    $('.timesheet-entry-subject input', timesheetEntry).focus()
                })

            ]).catch(function (error) {
                logToScreen(error)
                logToConsole(error)
            })
        }
        if (flag == false) {
            rejectedToNew = true
            getTseWorkOrderId(timesheetSliderSFID)
            buildPicklistsLookups(true)
            buildWOLILookUp()
        }
    }

    if (rejectedToNew == true && timesheetEntry.hasClass('new')) {
        buildPicklistsLookups()
        buildWOLILookUpNew()
    }

    if (flag == false) {
        $('.title-value', timesheetEntry).text('Edit Allowance')
        timesheetEntry.removeClass('view edit clone create').addClass('edit')
        timesheetEntry.addClass('active')

        // Get the correct day - active day within active timesheet
        var correctDay = $('.timesheet.active .day.active')

        // Set the Launch View context
        if ($('body').hasClass('view-day')) {
            launchViewContext = 'view-day'
            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
        } else if ($('body').hasClass('view-day-list')) {
            launchViewContext = 'view-day-list'
            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
        } else if ($('body').hasClass('view-timesheet-entry-status')) {
            var date = timesheetEntry.attr('data-date')
            correctDay = $(".timesheet.active .day[data-date='" + date + "']")
            $('.timesheet.active .day.active').removeClass('active')
            correctDay.addClass('active')
            launchViewContext = 'view-timesheet-entry-status'
        }

        // Check to see what fields need to be hidden/shown
        // Check if the data has been changed, and enable the save button if so
        showHideFields()

        // Swap body class to view-timesheet-entry-edit and close any popups
        //$('body').removeClass('view-day view-day-list view-timesheet-entry-status').addClass('view-timesheet-entry-edit')
        changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
        closePopUps()

        // Focus on subject field
        $('.timesheet-entry-subject input', timesheetEntry).focus()
    }
}

// timesheet-entry-action-slider clone functionality
function cloneTimesheetEntry() {
    //hideInlineTSE()
    // Clone active timesheet entry
    var timesheetSliderSFID = $('#timesheet-entry-action-slider').attr('data-sfid')
    var timesheetToClone = $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]')
    var timesheetEntryClone = timesheetToClone.clone(true, true)

    // Get the correct day - active day within active timesheet
    var correctDay = $('.timesheet.active .day.active')

    // Set status header
    $('.title-value', timesheetEntryClone).text('Clone Allowance')

    // Delete sfid & date values
    $(timesheetEntryClone).attr('sfid', '')
    $('div.timesheet-entry-date div.value', timesheetEntryClone).text('')
    $('div.timesheet-entry-date input', timesheetEntryClone).attr('value', '')
    $('div.timesheet-entry-date input', timesheetEntryClone).val('')
    $('div.timesheet-entry-date input', timesheetEntryClone).change()

    // Delete id on JQueryUI Date picker otherwise datepicker uses wrong field
    $('div.timesheet-entry-date input', timesheetEntryClone).removeAttr('id')

    // Swap class to new, add class active, & add context class
    $(timesheetEntryClone).removeClass('new submitted rejected approved').addClass('new')
    $(timesheetEntryClone).addClass('active')
    $(timesheetEntryClone).removeClass('view edit clone create').addClass('clone')

    // Append clone into day-timesheet-entry-container
    $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]').parent().append(timesheetEntryClone)

    // Set the Launch View context
    if ($('body').hasClass('view-day')) {
        launchViewContext = 'view-day'
        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
    } else if ($('body').hasClass('view-day-list')) {
        launchViewContext = 'view-day-list'
        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
    } else if ($('body').hasClass('view-timesheet-entry-status')) {
        var date = timesheetEntryClone.attr('data-date')
        correctDay = $(".timesheet.active .day[data-date='" + date + "']")
        $('.timesheet.active .day.active').removeClass('active')
        correctDay.addClass('active')
        launchViewContext = 'view-timesheet-entry-status'
    }

    // Check to see what fields need to be hidden/shown
    // Check if the data has been changed, and enable the save button if so
    showHideFields()

    // Swap body class to view-timesheet-entry-edit and close any popups
    //  $('body').removeClass('view-day view-day-list view-timesheet-entry-status').addClass('view-timesheet-entry-edit')
    changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')

    closePopUps()

    // Focus on subject field
    $('.timesheet-entry-subject input', timesheetEntryClone).focus()
    $('button.next', '.timesheet-entry.active').attr('disabled', true)
    // enableDisableButtons()
}
function enableAndDisableIcons() {
    if($('.inline-form-container:visible').length>0){
        $('div.icon-actions-container div.inline-icons-wraper').addClass('input-disabled')
        $('.inline-btns-disabled button.footer-btn').attr('disabled', true)
		$('.inline-icon-disabled .day-header-totals a').addClass('no-event')
    } else {
        $('div.icon-actions-container div.inline-icons-wraper').removeClass('input-disabled')
        $('.inline-btns-disabled button.footer-btn').attr('disabled', false)
		$('.inline-icon-disabled .day-header-totals a').removeClass('no-event')
    }
}

//edit functionality 


function editInlineTimesheetEntry(ele, action) {
    var chkSAFlg = false;
    if (action === 'view'){
        dayInlineTSClick = false
    }
    inlineTsEntry = true
    selectedPickUp = ""
    selectedLookUp = ""
    TSErecordTypeid = '';
    
    if($(ele).parents().hasClass('inline-icons-wraper')) {
        var timesheetSliderSFID = $(ele).closest('.timesheet-entry').attr('data-sfid')
    } else {
    	var timesheetSliderSFID = $('#timesheet-entry-action-slider').attr('data-sfid')
    }
    if (setFeatureFlag && action !== 'view') {
        var fetchTSEType = 'Select'
        var fetchTSEForGermany = {
            'query': "Select Count() cnt from timesheetentry tse, serviceappointment sa where tse.FSLABB_ServiceAppointment_ref__c = sa.Id AND tse.id in ('" + timesheetSliderSFID + "') AND sa.Status in ('Completed','Canceled','Cannot Complete') and tse.RecordTypeid = '" + workOrderRelated +"'"
        }
        callJSAPI(fetchTSEType, fetchTSEForGermany, 'TimesheetEntry').then(function(data){
            if((data && data[0].cnt > 0) || (saStatus == 'Completed' || saStatus == 'Canceled' || saStatus =='Cannot Complete')){
                chkSAFlg = true;
                $('#timesheet-entry-action-slider').removeClass('active')
                finalSAStatus = true;
                showDialogueBox('notification')
                $('#pop-ups').addClass('active')
            } else {
			    var timesheetEntry = $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]')
			    var activeTS = timesheetEntry
			    var TimesheetEntryData = timesheetEntry.attr('data-ts-entry')
			    var flag = false
			    var woRelated = timesheetEntry.hasClass('work-order-related')
			    var nonWoRelated = timesheetEntry.hasClass('non-work-order-related')
                
			    buildInlineTsEntry(TimesheetEntryData, timesheetEntry)
			    if (action != 'view') {
			        timesheetEntry.addClass('active')
			    }
			    timesheetEntry = $('div.inline-form-container[data-sfid="' + timesheetSliderSFID + '"]')
			    if (action === 'view') {
			        timesheetEntry.removeClass('view edit clone create global_create').addClass('view')
			    } else {
			        timesheetEntry.removeClass('view edit clone create global_create').addClass('edit')
			    }
			
			    $('.tcolumn.action-inline-btn').hide()
			    $('.tcolumn.tcolumn_new').hide()
			    $('div.timesheet-entry-date input', timesheetEntry).attr('disabled', true)
			    $('div.timesheet-entry-date input', timesheetEntry).removeAttr('id')
			    $('div.timesheet-entry-date input', timesheetEntry).removeClass('hasDatepicker')
			    if (activeTS.hasClass('rejected')) {
			        $('div.timesheet-entry-reject-reason', timesheetEntry).show()
			        $('div.timesheet-entry-reject-reason input', timesheetEntry).attr('disabled', true)
			        var woRelated = activeTS.hasClass('work-order-related')
			        var nonWoRelated = activeTS.hasClass('non-work-order-related')
			
			        if (objectId && nonWoRelated) {
			            flag = true
			            var data = {
			                'RecordTypeId': nonWorkOrderRelated
			            }
			            var unproductiveCodeData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_UnproductiveCode__c')
			            return Promise.all([
			                unproductiveCodeData.then(function (result) {
			                    picklistData.FSLABB_UnproductiveCode__c = result
			                    createPicklist('FSLABB_UnproductiveCode__c')
			                }).then(function () {
			                    getTseWorkOrderId(timesheetSliderSFID)
			                    var unproductiveCodeValue = getUnproductiveCode(unproductiveCodeTSE)
			                    $('div.timesheet-entry-FSLABB_UnproductiveCode__c input').val(unproductiveCodeValue)
			                    var finalLabour = getLabourCode(labourCurrencyVal)
			                    $('div.timesheet-entry-FSLABB_Price__c input', timesheetEntry).val(labourVal)
			                    $('div.timesheet-entry-FSLABB_Price__c div.value', timesheetEntry).text(labourVal)
			                    $('div.timesheet-entry-FSLABB_Currency__c input', timesheetEntry).val(finalLabour)
			                    $('div.timesheet-entry-FSLABB_Currency__c div.value', timesheetEntry).text(finalLabour)
			                    //$('.title-value', timesheetEntry).text('Edit Timesheet Entry')
			                    //timesheetEntry.removeClass('view edit clone create').addClass('edit')
			                    // timesheetEntry.addClass('active')
			
			                    // Get the correct day - active day within active timesheet
			                    var correctDay = $('.timesheet.active .day.active')
			
			                    // Set the Launch View context
			                    if ($('body').hasClass('view-day')) {
			                        launchViewContext = 'view-day'
			                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
			                    } else if ($('body').hasClass('view-day-list')) {
			                        launchViewContext = 'view-day-list'
			                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
			                    } else if ($('body').hasClass('view-timesheet-entry-status')) {
			                        var date = activeTS.attr('data-date')
			                        correctDay = $(".timesheet.active .day[data-date='" + date + "']")
			                        $('.timesheet.active .day.active').removeClass('active')
			                        correctDay.addClass('active')
			                        launchViewContext = 'view-timesheet-entry-status'
			                    }
			
			                    // Check to see what fields need to be hidden/shown
			                    // Check if the data has been changed, and enable the save button if so
			                    showHideFields()
			
			                    // Swap body class to view-timesheet-entry-edit and close any popups
			                    // changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
			                    $('.inline-form-container').css({ display: 'block' })
			                    closePopUps()
			
			                    // Focus on subject field
			                    $('.timesheet-entry-subject input', timesheetEntry).focus()
                                buildSDLineItemLookup(timesheetEntry, false)
			                    if (action === 'view') {
			                        showTTTKFields();
			                    } else {
			                    showTTTKFields(false);
			                    }                   
                                 //  code 33013
                                 // showHrUpDownFields();
                                 //  code 33013
                                 // Code for 50834
                                 // showAllowanceFields("edit");
                                 var hrdown = country[userCountry].fields['HR_Down__c'];
                                 var hrup = country[userCountry].fields['HR_Up__c'];
                                 var timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c input:visible', timesheetEntry)
                                 if (timeEntryType.length > 0 && hrup && (hrup['Display'] === "TRUE") && hrdown && (hrdown['Display'] === "TRUE")) {
                                     showHrUpDownFields()
                                 } else {
                                     $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Up__c").hide()
                                     $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Down__c").hide()
                                 }
                                 if (action === 'view') {
                                     timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c .value', timesheetEntry)
                                     if(timeEntryType.attr('data-id') !== ""){
                                         showHrUpDownFields()
                                     }
                                 }
                                 if (action === 'view') {
                                       showAllowanceFields("view");  
                                 } else {
                                         showAllowanceFields('edit') 
                                 }
                                 if (action != 'view') {
                                     enableDisableButtons()
                                 }
                                 if (action !== 'view'){
                                     enableAndDisableIcons()
                                 }
			
                                 //  code 33013
                                 // showHrUpDownFields();
                                 //  code 33013
                                 // Code for 50834
                                 // showAllowanceFields("edit");
                                 var hrdown = country[userCountry].fields['HR_Down__c'];
                                 var hrup = country[userCountry].fields['HR_Up__c'];
                                 var timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c input:visible', timesheetEntry)
                                 if (timeEntryType.length > 0 && hrup && (hrup['Display'] === "TRUE") && hrdown && (hrdown['Display'] === "TRUE")) {
                                     showHrUpDownFields()
                                 } else {
                                     $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Up__c").hide()
                                     $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Down__c").hide()
                                 }
                                 if (action === 'view') {
                                     timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c .value', timesheetEntry)
                                     if(timeEntryType.attr('data-id') !== ""){
                                         showHrUpDownFields()
                                     }
                                 }
                                 if (action === 'view') {
                                       showAllowanceFields("view");  
                                 } else {
                                         showAllowanceFields('edit') 
                                 }
                                 if (action != 'view') {
                                     enableDisableButtons()
                                 }
                                 if (action !== 'view'){
                                     enableAndDisableIcons()
                                 }

			                })
			
			            ]).catch(function (error) {
			                logToScreen(error)
			                logToConsole(error)
			            })
			        } else if (!objectId && woRelated) {
			            // Display SdcodeLineorderitem in WO from non-WO Weekly rejected tab starts 
			            var lineId = '';
			            var sdData = {
			                'query': "SELECT FSLABB_ServiceAppointment_ref__c,WorkOrderId,FSLABB_SD_Sales_Order_Line_Item__c,RecordTypeId,FSLABB_SAP_Link_Type__c FROM TimeSheetEntry WHERE Id = '" + timesheetSliderSFID + "'"
			            }
			
			            var sDTimesheetsData = callJSAPI('select', sdData, 'TimeSheetEntry')
			
			            sDTimesheetsData.then(function (result) {
			                TSErecordTypeid = result[0].RecordTypeId
			
			                // Getting WorkOrdeLineItem data
			
			                var SdWorkOrderLineItemQuery = {
			                    'query': "SELECT Id, LineItemNumber, Subject FROM WorkOrderLineItem WHERE workOrderId='" + result[0].WorkOrderId + "' ORDER BY LineItemNumber ASC"
			                }
			                var sdWorkOrderLineItemData = callJSAPI('select', SdWorkOrderLineItemQuery, 'WorkOrderLineItem')
			
			                sdWorkOrderLineItemData.then(function (result) {
			                    lookupData.WorkOrderLineItem = result
			                    createLookupWOLI('WorkOrderLineItem')
			                });
			
			                if (TSErecordTypeid == workOrderRelated && result[0].FSLABB_SAP_Link_Type__c == 'SD_ORDER') {
			
			                    lineId = result[0].FSLABB_SD_Sales_Order_Line_Item__c;
			                    var qrySalesOrderLineItemQuery = {
			                        'query': `SELECT Id, FSLABB_SAP_Description__c, Name, FSLABB_Status__c FROM FSLABB_SD_Sales_Order_Line_Item__c WHERE FSLABB_Status__c != 'Closed' AND FSLABB_Work_Order__c = '${result[0].WorkOrderId}'`
			                    }
			                    var qrySalesOrderLineItemData = callJSAPI('select', qrySalesOrderLineItemQuery, 'FSLABB_SD_Sales_Order_Line_Item__c')
			
			                    //Getting SD sales order Line Item
			                    qrySalesOrderLineItemData.then(function (result) {
			
			                        lookupData.FSLABB_SD_Sales_Order_Line_Item__c = result
			                        createLookupSalesOrder('FSLABB_SD_Sales_Order_Line_Item__c')
			
			                        for (var i = 0; i < result.length; i++) {
			                            if (lineId == result[i].Id) {
			
			                                $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"] div.timesheet-entry-content .timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c div.value', timesheetEntry).text(result[i].FSLABB_SAP_Description__c)
			                                $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"] div.timesheet-entry-content .timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c input', timesheetEntry).val(result[i].FSLABB_SAP_Description__c)
			                                var sdField = $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"] div.timesheet-entry-content .timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c', timesheetEntry)
			                                var requiredClass = 'required-on-work-order-related'
			                                $(sdField).attr('style', 'display: flex');
			                                $('input', sdField).addClass(requiredClass)
			                            }
			                        }
			                    });
			                }
			            });
			
			            // Display SdcodeLineorderitem in WO from non-WO Weekly rejected tab startsends
			            flag = true
			            var data = {
			                'RecordTypeId': workOrderRelated
			            }
			
			            var timeEntryTSE = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_TimeEntryType__c')
			            return Promise.all([
			                timeEntryTSE.then(function (result) {
			                    picklistData.FSLABB_TimeEntryType__c = result
			                    createPicklist('FSLABB_TimeEntryType__c')
			                }).then(function () {
			                    getTseWorkOrderId(timesheetSliderSFID)
			                    var timeEntryValue = getTimeEntry(timeEntryIdTse)
			                    $('div.timesheet-entry-FSLABB_TimeEntryType__c input', timesheetEntry).val(timeEntryValue)
			                    $('div.timesheet-entry-FSLABB_TimeEntryType__c div.value', timesheetEntry).text(timeEntryValue)
			                    var finalLabour = getLabourCode(labourCurrencyVal)
			                    $('div.timesheet-entry-FSLABB_Price__c input', timesheetEntry).val(labourVal)
			                    $('div.timesheet-entry-FSLABB_Price__c div.value', timesheetEntry).text(labourVal)
			                    $('div.timesheet-entry-FSLABB_Currency__c input', timesheetEntry).val(finalLabour)
			                    $('div.timesheet-entry-FSLABB_Currency__c div.value', timesheetEntry).text(finalLabour)
			                    //$('.title-value', timesheetEntry).text('Edit Timesheet Entry')
			                    // timesheetEntry.removeClass('view edit clone create').addClass('edit')
			                    // timesheetEntry.addClass('active')
			
			                    // Get the correct day - active day within active timesheet
			                    var correctDay = $('.timesheet.active .day.active')
			
			                    // Set the Launch View context
			                    if ($('body').hasClass('view-day')) {
			                        launchViewContext = 'view-day'
			                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
			                    } else if ($('body').hasClass('view-day-list')) {
			                        launchViewContext = 'view-day-list'
			                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
			                    } else if ($('body').hasClass('view-timesheet-entry-status')) {
			                        var date = activeTS.attr('data-date')
			                        correctDay = $(".timesheet.active .day[data-date='" + date + "']")
			                        $('.timesheet.active .day.active').removeClass('active')
			                        correctDay.addClass('active')
			                        launchViewContext = 'view-timesheet-entry-status'
			                    }
			
			                    // Check to see what fields need to be hidden/shown
			                    // Check if the data has been changed, and enable the save button if so
			                    showHideFields()
			
			                    // Swap body class to view-timesheet-entry-edit and close any popups
			                    //changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
			                    $('.inline-form-container').css({ display: 'block' })
			                    closePopUps()
			
			                    // Focus on subject field
			                    if (action != 'view') {
			                    $('.timesheet-entry-subject input', timesheetEntry).focus()
			                    }                   
			
			                    if (action === 'view') {
			                        showTTTKFields();
			                    } else {
			                    showTTTKFields(false);
			                    }
                                 //  code 33013
                                 // showHrUpDownFields();
                                 //  code 33013
                                 // Code for 50834
                                 // showAllowanceFields("edit");
                                 var hrdown = country[userCountry].fields['HR_Down__c'];
                                 var hrup = country[userCountry].fields['HR_Up__c'];
                                 var timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c input:visible', timesheetEntry)
                                 if (timeEntryType.length > 0 && hrup && (hrup['Display'] === "TRUE") && hrdown && (hrdown['Display'] === "TRUE")) {
                                     showHrUpDownFields()
                                 } else {
                                     $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Up__c").hide()
                                     $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Down__c").hide()
                                 }
                                 if (action === 'view') {
                                     timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c .value', timesheetEntry)
                                     if(timeEntryType.attr('data-id') !== ""){
                                         showHrUpDownFields()
                                     }
                                 }
                                 if (action === 'view') {
                                       showAllowanceFields("view");  
                                 } else {
                                         showAllowanceFields('edit') 
                                 }
                                 if (action != 'view') {
                                     enableDisableButtons()
                                 }
                                 if (action !== 'view'){
                                     enableAndDisableIcons()
                                 }
			                })
			
			            ]).catch(function (error) {
			                logToScreen(error)
			                logToConsole(error)
			            })
			        } else if (flag == false) {
			            if (action != 'view') {
			            rejectedToNew = true
			            }
			            getTseWorkOrderId(timesheetSliderSFID)
			            if (action != 'view') {
			            buildWOLILookUp()
                        buildSDLineItemLookup(timesheetEntry, false)
			        }
			    }
			    }
			    if (action != 'view') {
			    	if (rejectedToNew == true && activeTS.hasClass('new')) {
			        	newTSE = '.inline-timesheet-entry-table .trow:last'
			        	buildWOLILookUpNew(newTSE)
                        buildSDLineItemLookup(newTSE, false)
			        }
			    }
			
			    if (flag == false) { //line 4059 to 4074 for INC10338659
			        // $('.title-value', timesheetEntry).text('Edit Timesheet Entry')
			        //timesheetEntry.removeClass('view edit clone create').addClass('edit')
			        //timesheetEntry.addClass('active')
			        getTseWorkOrderId(timesheetSliderSFID)
			        buildWOLILookUp()
			
                    buildSDLineItemLookup(timesheetEntry, false)
			        // Get the correct day - active day within active timesheet
			        var correctDay = $('.timesheet.active .day.active')
			        //buildPicklistsLookups()
			        getTseWorkOrderId(timesheetSliderSFID)
			        var finalLabour = getLabourCode(labourCurrencyVal)
			        if (objectId && nonWoRelated) {
			            var data = {
			                'RecordTypeId': nonWorkOrderRelated
			            }
			            var unproductiveCodeData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_UnproductiveCode__c')
			            unproductiveCodeData.then(function (result) {
			                picklistData.FSLABB_UnproductiveCode__c = result
			                createPicklist('FSLABB_UnproductiveCode__c')
			                getTseWorkOrderId(timesheetSliderSFID)
			                var unproductiveCodeValue = getUnproductiveCode(unproductiveCodeTSE)
			                $('div.timesheet-entry-FSLABB_UnproductiveCode__c input', timesheetEntry).val(unproductiveCodeValue)
			                $('div.timesheet-entry-FSLABB_UnproductiveCode__c div.value', timesheetEntry).text(unproductiveCodeValue)
			            })
			                .catch(function (error) {
			                    logToScreen(error)
			                    logToConsole(error)
			                })
			        }
			
			        $('div.timesheet-entry-FSLABB_Price__c input', timesheetEntry).val(labourVal)
			        $('div.timesheet-entry-FSLABB_Price__c div.value', timesheetEntry).text(labourVal)
			        $('div.timesheet-entry-FSLABB_Currency__c input', timesheetEntry).val(finalLabour)
			        $('div.timesheet-entry-FSLABB_Currency__c div.value', timesheetEntry).text(finalLabour)
			
			        // Set the Launch View context
			        if ($('body').hasClass('view-day')) {
			            launchViewContext = 'view-day'
			            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
			        } else if ($('body').hasClass('view-day-list')) {
			            launchViewContext = 'view-day-list'
			            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
			        } else if ($('body').hasClass('view-timesheet-entry-status')) {
			            var date = activeTS.attr('data-date')
			            correctDay = $(".timesheet.active .day[data-date='" + date + "']")
			            $('.timesheet.active .day.active').removeClass('active')
			            correctDay.addClass('active')
			            launchViewContext = 'view-timesheet-entry-status'
			        }
			
			        // Check to see what fields need to be hidden/shown
			        // Check if the data has been changed, and enable the save button if so
			        showHideFields()
			
			        // Swap body class to view-timesheet-entry-edit and close any popups
			        //changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
			        closePopUps()
			        $('.inline-form-container').css({ display: 'block' })
			        if (action != 'view') {
			        // Focus on subject field
			        $('.timesheet-entry-subject input', timesheetEntry).focus()
			        activityTypePopulate(timesheetSliderSFID)
			        }
			        $('input, textarea', timesheetEntry).each(function (index, element) {
			            if (!$(element).hasClass('datepicker')) {
			                $(element).val($(element).siblings('.value').text()) // revert values to original
			                $(element).attr('data-id', $(element).siblings('.value').attr('data-id')) // revert data to values
			
			                if ($(element).hasClass('FSLABB_ActivityType__c__input')) {
			                    $(element).attr('data-id', activityVar)
			                }
			
			                if ($(element).hasClass('number')) {
			                    if ($(element).siblings('.value').text()) {
			                        // Code for 50834
			                        if (isNaN(parseFloat($(element).siblings('.value').text()))) {
			                            $(element).val($(element).siblings('.value').text())
			                        } else {
			                            $(element).val(parseFloat($(element).siblings('.value').text()).toFixed(2).replace(/\.00$/, ''))
			                        }
			                    }
			                }
			
			                if ($(element).hasClass('FSLABB_ABBOvertimeCategory__c__input')) {
			                    var did = $(element).attr("data-id");
			                    if (did && did != '') {
			                        var OCFSLABB_ActivityType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_ActivityType'] input").addClass("input-disabled");
			                        var OCFSLABB_WageType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Wage_Type'] input").addClass("input-disabled");
			                        var OCFSLABB_AbsenceType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Absence_Type'] input").addClass("input-disabled");
			                    } else {
                                    var OCFSLABB_ActivityType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_ActivityType'] input").removeClass("input-disabled");
                                    var OCFSLABB_WageType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Wage_Type'] input").removeClass("input-disabled");
                                    var OCFSLABB_AbsenceType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Absence_Type'] input").removeClass("input-disabled");
			                    }
			                }
			            } else { // If datepicker then set values from TSE data-date
			                var date = activeTS.attr('data-date')
			                $(element).attr('value', date)
			                $(element).val(setLocaleDateString(date))
			            }
			        })
			    }
			    if (action === 'view') {
			       showTTTKFields();
			    } else {
			    showTTTKFields(false);
			    }
			    //  code 33013
			    // showHrUpDownFields();
			    //  code 33013
			    // Code for 50834
			    // showAllowanceFields("edit");
			    var hrdown = country[userCountry].fields['HR_Down__c'];
			    var hrup = country[userCountry].fields['HR_Up__c'];
			    var timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c input:visible', timesheetEntry)
			    if (timeEntryType.length > 0 && hrup && (hrup['Display'] === "TRUE") && hrdown && (hrdown['Display'] === "TRUE")) {
			        showHrUpDownFields()
			    } else {
			        $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Up__c").hide()
			        $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Down__c").hide()
			    }
			    if (action === 'view') {
			        timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c .value', timesheetEntry)
			        if(timeEntryType.attr('data-id') !== ""){
			            showHrUpDownFields()
			        }
			    }
			    if (action === 'view') {
			          showAllowanceFields("view");  
			    } else {
			            showAllowanceFields('edit') 
			    }
			    if (action != 'view') {
			        enableDisableButtons()
			    }
				if (action !== 'view'){
					enableAndDisableIcons()
				}
            }
        })
        
    } else {
	    var timesheetEntry = $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]')
	    var activeTS = timesheetEntry
	    var TimesheetEntryData = timesheetEntry.attr('data-ts-entry')
	    var flag = false
	    var woRelated = timesheetEntry.hasClass('work-order-related')
	    var nonWoRelated = timesheetEntry.hasClass('non-work-order-related')
       
	    buildInlineTsEntry(TimesheetEntryData, timesheetEntry)
	    if (action != 'view') {
	        timesheetEntry.addClass('active')
	    }
	    timesheetEntry = $('div.inline-form-container[data-sfid="' + timesheetSliderSFID + '"]')
	    if (action === 'view') {
	        timesheetEntry.removeClass('view edit clone create global_create').addClass('view')
	    } else {
	        timesheetEntry.removeClass('view edit clone create global_create').addClass('edit')
	    }
	
	    $('.tcolumn.action-inline-btn').hide()
	    $('.tcolumn.tcolumn_new').hide()
	    $('div.timesheet-entry-date input', timesheetEntry).attr('disabled', true)
	    $('div.timesheet-entry-date input', timesheetEntry).removeAttr('id')
	    $('div.timesheet-entry-date input', timesheetEntry).removeClass('hasDatepicker')
	    if (activeTS.hasClass('rejected')) {
	        $('div.timesheet-entry-reject-reason', timesheetEntry).show()
	        $('div.timesheet-entry-reject-reason input', timesheetEntry).attr('disabled', true)
	        var woRelated = activeTS.hasClass('work-order-related')
	        var nonWoRelated = activeTS.hasClass('non-work-order-related')
	
	        if (objectId && nonWoRelated) {
	            flag = true
	            var data = {
	                'RecordTypeId': nonWorkOrderRelated
	            }
	            var unproductiveCodeData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_UnproductiveCode__c')
	            return Promise.all([
	                unproductiveCodeData.then(function (result) {
	                    picklistData.FSLABB_UnproductiveCode__c = result
	                    createPicklist('FSLABB_UnproductiveCode__c')
	                }).then(function () {
	                    getTseWorkOrderId(timesheetSliderSFID)
	                    var unproductiveCodeValue = getUnproductiveCode(unproductiveCodeTSE)
	                    $('div.timesheet-entry-FSLABB_UnproductiveCode__c input').val(unproductiveCodeValue)
	                    var finalLabour = getLabourCode(labourCurrencyVal)
	                    $('div.timesheet-entry-FSLABB_Price__c input', timesheetEntry).val(labourVal)
	                    $('div.timesheet-entry-FSLABB_Price__c div.value', timesheetEntry).text(labourVal)
	                    $('div.timesheet-entry-FSLABB_Currency__c input', timesheetEntry).val(finalLabour)
	                    $('div.timesheet-entry-FSLABB_Currency__c div.value', timesheetEntry).text(finalLabour)
	                    //$('.title-value', timesheetEntry).text('Edit Timesheet Entry')
	                    //timesheetEntry.removeClass('view edit clone create').addClass('edit')
	                    // timesheetEntry.addClass('active')
	
	                    // Get the correct day - active day within active timesheet
	                    var correctDay = $('.timesheet.active .day.active')
	
	                    // Set the Launch View context
	                    if ($('body').hasClass('view-day')) {
	                        launchViewContext = 'view-day'
	                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
	                    } else if ($('body').hasClass('view-day-list')) {
	                        launchViewContext = 'view-day-list'
	                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
	                    } else if ($('body').hasClass('view-timesheet-entry-status')) {
	                        var date = activeTS.attr('data-date')
	                        correctDay = $(".timesheet.active .day[data-date='" + date + "']")
	                        $('.timesheet.active .day.active').removeClass('active')
	                        correctDay.addClass('active')
	                        launchViewContext = 'view-timesheet-entry-status'
	                    }
	
	                    // Check to see what fields need to be hidden/shown
	                    // Check if the data has been changed, and enable the save button if so
	                    showHideFields()
	
	                    // Swap body class to view-timesheet-entry-edit and close any popups
	                    // changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
	                    $('.inline-form-container').css({ display: 'block' })
	                    closePopUps()
	
	                    buildSDLineItemLookup(timesheetEntry, false)
	                    // Focus on subject field
	                    $('.timesheet-entry-subject input', timesheetEntry).focus()
	                    if (action === 'view') {
	                        showTTTKFields();
	                    } else {
	                    	showTTTKFields(false);
	                    }
                         //  code 33013
                         // showHrUpDownFields();
                         //  code 33013
                         // Code for 50834
                         // showAllowanceFields("edit");
                         var hrdown = country[userCountry].fields['HR_Down__c'];
                         var hrup = country[userCountry].fields['HR_Up__c'];
                         var timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c input:visible', timesheetEntry)
                         if (timeEntryType.length > 0 && hrup && (hrup['Display'] === "TRUE") && hrdown && (hrdown['Display'] === "TRUE")) {
                             showHrUpDownFields()
                         } else {
                             $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Up__c").hide()
                             $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Down__c").hide()
                         }
                         if (action === 'view') {
                             timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c .value', timesheetEntry)
                             if(timeEntryType.attr('data-id') !== ""){
                                 showHrUpDownFields()
                             }
                         }
                         if (action === 'view') {
                               showAllowanceFields("view");  
                         } else {
                                 showAllowanceFields('edit') 
                         }
                         if (action != 'view') {
                             enableDisableButtons()
                         }
                         if (action !== 'view'){
                             enableAndDisableIcons()
                         }              
	                })
	            ]).catch(function (error) {
	                logToScreen(error)
	                logToConsole(error)
	            })
	        } else if (!objectId && woRelated) {
	            // Display SdcodeLineorderitem in WO from non-WO Weekly rejected tab starts 
	            var lineId = '';
	            var sdData = {
	                'query': "SELECT FSLABB_ServiceAppointment_ref__c,WorkOrderId,FSLABB_SD_Sales_Order_Line_Item__c,RecordTypeId,FSLABB_SAP_Link_Type__c FROM TimeSheetEntry WHERE Id = '" + timesheetSliderSFID + "'"
	            }
	            var sDTimesheetsData = callJSAPI('select', sdData, 'TimeSheetEntry')
	            sDTimesheetsData.then(function (result) {
	                TSErecordTypeid = result[0].RecordTypeId
	
	                // Getting WorkOrdeLineItem data
	
	                var SdWorkOrderLineItemQuery = {
	                    'query': "SELECT Id, LineItemNumber, Subject FROM WorkOrderLineItem WHERE workOrderId='" + result[0].WorkOrderId + "' ORDER BY LineItemNumber ASC"
	                }
	                var sdWorkOrderLineItemData = callJSAPI('select', SdWorkOrderLineItemQuery, 'WorkOrderLineItem')
	
	                sdWorkOrderLineItemData.then(function (result) {
	                    lookupData.WorkOrderLineItem = result
	                    createLookupWOLI('WorkOrderLineItem')
	                });
	
	                if (TSErecordTypeid == workOrderRelated && result[0].FSLABB_SAP_Link_Type__c == 'SD_ORDER') {
	                    lineId = result[0].FSLABB_SD_Sales_Order_Line_Item__c;
	                    var qrySalesOrderLineItemQuery = {
	                        'query': `SELECT Id, FSLABB_SAP_Description__c, Name, FSLABB_Status__c FROM FSLABB_SD_Sales_Order_Line_Item__c WHERE FSLABB_Status__c != 'Closed' AND FSLABB_Work_Order__c = '${result[0].WorkOrderId}'`
	                    }
	                    var qrySalesOrderLineItemData = callJSAPI('select', qrySalesOrderLineItemQuery, 'FSLABB_SD_Sales_Order_Line_Item__c')
	
	                    //Getting SD sales order Line Item
	                    qrySalesOrderLineItemData.then(function (result) {
	
	                        lookupData.FSLABB_SD_Sales_Order_Line_Item__c = result
	                        createLookupSalesOrder('FSLABB_SD_Sales_Order_Line_Item__c')
	
	                        for (var i = 0; i < result.length; i++) {
	                            if (lineId == result[i].Id) {
	
	                                $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"] div.timesheet-entry-content .timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c div.value', timesheetEntry).text(result[i].FSLABB_SAP_Description__c)
	                                $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"] div.timesheet-entry-content .timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c input', timesheetEntry).val(result[i].FSLABB_SAP_Description__c)
	                                var sdField = $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"] div.timesheet-entry-content .timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c', timesheetEntry)
	                                var requiredClass = 'required-on-work-order-related'
	                                $(sdField).attr('style', 'display: flex');
	                                $('input', sdField).addClass(requiredClass)
	                            }
	                        }
	                    });
	                }
	            });
	
	            // Display SdcodeLineorderitem in WO from non-WO Weekly rejected tab startsends
	            flag = true
	            var data = {
	                'RecordTypeId': workOrderRelated
	            }
	
	            var timeEntryTSE = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_TimeEntryType__c')
	            return Promise.all([
	                timeEntryTSE.then(function (result) {
	                    picklistData.FSLABB_TimeEntryType__c = result
	                    createPicklist('FSLABB_TimeEntryType__c')
	                }).then(function () {
	                    getTseWorkOrderId(timesheetSliderSFID)
	                    var timeEntryValue = getTimeEntry(timeEntryIdTse)
	                    $('div.timesheet-entry-FSLABB_TimeEntryType__c input', timesheetEntry).val(timeEntryValue)
	                    $('div.timesheet-entry-FSLABB_TimeEntryType__c div.value', timesheetEntry).text(timeEntryValue)
	                    var finalLabour = getLabourCode(labourCurrencyVal)
	                    $('div.timesheet-entry-FSLABB_Price__c input', timesheetEntry).val(labourVal)
	                    $('div.timesheet-entry-FSLABB_Price__c div.value', timesheetEntry).text(labourVal)
	                    $('div.timesheet-entry-FSLABB_Currency__c input', timesheetEntry).val(finalLabour)
	                    $('div.timesheet-entry-FSLABB_Currency__c div.value', timesheetEntry).text(finalLabour)
	                    //$('.title-value', timesheetEntry).text('Edit Timesheet Entry')
	                    // timesheetEntry.removeClass('view edit clone create').addClass('edit')
	                    // timesheetEntry.addClass('active')
	
	                    // Get the correct day - active day within active timesheet
	                    var correctDay = $('.timesheet.active .day.active')
	
	                    // Set the Launch View context
	                    if ($('body').hasClass('view-day')) {
	                        launchViewContext = 'view-day'
	                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
	                    } else if ($('body').hasClass('view-day-list')) {
	                        launchViewContext = 'view-day-list'
	                        correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
	                    } else if ($('body').hasClass('view-timesheet-entry-status')) {
	                        var date = activeTS.attr('data-date')
	                        correctDay = $(".timesheet.active .day[data-date='" + date + "']")
	                        $('.timesheet.active .day.active').removeClass('active')
	                        correctDay.addClass('active')
	                        launchViewContext = 'view-timesheet-entry-status'
	                    }
	
	                    // Check to see what fields need to be hidden/shown
	                    // Check if the data has been changed, and enable the save button if so
	                    showHideFields()
	
	                    // Swap body class to view-timesheet-entry-edit and close any popups
	                    //changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
	                    $('.inline-form-container').css({ display: 'block' })
	                    closePopUps()
	
	                    // Focus on subject field
	                    if (action != 'view') {
	                    	$('.timesheet-entry-subject input', timesheetEntry).focus()
	                    }                   
	                    if (action === 'view') {
	                        showTTTKFields();
	                    } else {
	                    	showTTTKFields(false);
	                    }
                         //  code 33013
                         // showHrUpDownFields();
                         //  code 33013
                         // Code for 50834
                         // showAllowanceFields("edit");
                         var hrdown = country[userCountry].fields['HR_Down__c'];
                         var hrup = country[userCountry].fields['HR_Up__c'];
                         var timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c input:visible', timesheetEntry)
                         if (timeEntryType.length > 0 && hrup && (hrup['Display'] === "TRUE") && hrdown && (hrdown['Display'] === "TRUE")) {
                             showHrUpDownFields()
                         } else {
                             $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Up__c").hide()
                             $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Down__c").hide()
                         }
                         if (action === 'view') {
                             timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c .value', timesheetEntry)
                             if(timeEntryType.attr('data-id') !== ""){
                                 showHrUpDownFields()
                             }
                         }
                         if (action === 'view') {
                               showAllowanceFields("view");  
                         } else {
                                 showAllowanceFields('edit') 
                         }
                         if (action != 'view') {
                             enableDisableButtons()
                         }
                         if (action !== 'view'){
                             enableAndDisableIcons()
                         }
	                })
	
	            ]).catch(function (error) {
	                logToScreen(error)
	                logToConsole(error)
	            })
	        } else if (flag == false) {
	            if (action != 'view') {
	            rejectedToNew = true
	            }
	            getTseWorkOrderId(timesheetSliderSFID)
	            if (action != 'view') {
	            buildWOLILookUp()
	        }
	    }
	    }
	    if (action != 'view') {
	    	if (rejectedToNew == true && activeTS.hasClass('new')) {
	        	newTSE = '.inline-timesheet-entry-table .trow:last'
	        	buildWOLILookUpNew(newTSE)
            buildSDLineItemLookup(newTSE, false)
	        }
	    }
	
	    if (flag == false) { //line 4059 to 4074 for INC10338659
	        // $('.title-value', timesheetEntry).text('Edit Timesheet Entry')
	        //timesheetEntry.removeClass('view edit clone create').addClass('edit')
	        //timesheetEntry.addClass('active')
	        getTseWorkOrderId(timesheetSliderSFID)
	        buildWOLILookUp()
	
	        buildSDLineItemLookup(timesheetEntry, false)
	        // Get the correct day - active day within active timesheet
	        var correctDay = $('.timesheet.active .day.active')
	        //buildPicklistsLookups()
	        getTseWorkOrderId(timesheetSliderSFID)
	        //var finalLabour = getLabourCode(labourCurrencyVal)
	        if (objectId && nonWoRelated) {
	            var data = {
	                'RecordTypeId': nonWorkOrderRelated
	            }
	            var unproductiveCodeData = callJSAPI('getUnfilteredPicklist', data, 'TimeSheetEntry', 'FSLABB_UnproductiveCode__c')
	            unproductiveCodeData.then(function (result) {
	                picklistData.FSLABB_UnproductiveCode__c = result
	                createPicklist('FSLABB_UnproductiveCode__c')
	                getTseWorkOrderId(timesheetSliderSFID)
	                var unproductiveCodeValue = getUnproductiveCode(unproductiveCodeTSE)
	                $('div.timesheet-entry-FSLABB_UnproductiveCode__c input', timesheetEntry).val(unproductiveCodeValue)
	                $('div.timesheet-entry-FSLABB_UnproductiveCode__c div.value', timesheetEntry).text(unproductiveCodeValue)
	            })
	                .catch(function (error) {
	                    logToScreen(error)
	                    logToConsole(error)
	                })
	        }
	
	        //$('div.timesheet-entry-FSLABB_Price__c input', timesheetEntry).val(labourVal)
	        //$('div.timesheet-entry-FSLABB_Price__c div.value', timesheetEntry).text(labourVal)
	        //$('div.timesheet-entry-FSLABB_Currency__c input', timesheetEntry).val(finalLabour)
	        //$('div.timesheet-entry-FSLABB_Currency__c div.value', timesheetEntry).text(finalLabour)
	
	        // Set the Launch View context
	        if ($('body').hasClass('view-day')) {
	            launchViewContext = 'view-day'
	            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
	        } else if ($('body').hasClass('view-day-list')) {
	            launchViewContext = 'view-day-list'
	            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
	        } else if ($('body').hasClass('view-timesheet-entry-status')) {
	            var date = activeTS.attr('data-date')
	            correctDay = $(".timesheet.active .day[data-date='" + date + "']")
	            $('.timesheet.active .day.active').removeClass('active')
	            correctDay.addClass('active')
	            launchViewContext = 'view-timesheet-entry-status'
	        }
	
	        // Check to see what fields need to be hidden/shown
	        // Check if the data has been changed, and enable the save button if so
	        showHideFields()
	
	        // Swap body class to view-timesheet-entry-edit and close any popups
	        //changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
	        closePopUps()
	        $('.inline-form-container').css({ display: 'block' })
	        if (action != 'view') {
	        // Focus on subject field
	        $('.timesheet-entry-subject input', timesheetEntry).focus()
	        //activityTypePopulate(timesheetSliderSFID)
	        }
	        $('input, textarea', timesheetEntry).each(function (index, element) {
	            if (!$(element).hasClass('datepicker')) {
	                $(element).val($(element).siblings('.value').text()) // revert values to original
	                $(element).attr('data-id', $(element).siblings('.value').attr('data-id')) // revert data to values
	
	                if ($(element).hasClass('FSLABB_ActivityType__c__input')) {
	                    $(element).attr('data-id', activityVar)
	                }
	
	                if ($(element).hasClass('number')) {
	                    if ($(element).siblings('.value').text()) {
	                        // Code for 50834
	                        if (isNaN(parseFloat($(element).siblings('.value').text()))) {
	                            $(element).val($(element).siblings('.value').text())
	                        } else {
	                            $(element).val(parseFloat($(element).siblings('.value').text()).toFixed(2).replace(/\.00$/, ''))
	                        }
	                    }
	                }

	                if ($(element).hasClass('FSLABB_ABBOvertimeCategory__c__input')) {
	                    var did = $(element).attr("data-id");
	                    if (did && did != '') {
	                        var OCFSLABB_ActivityType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_ActivityType'] input").addClass("input-disabled");
	                        var OCFSLABB_WageType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Wage_Type'] input").addClass("input-disabled");
	                        var OCFSLABB_AbsenceType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Absence_Type'] input").addClass("input-disabled");
	                    } else {
                            var OCFSLABB_ActivityType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_ActivityType'] input").removeClass("input-disabled");
                            var OCFSLABB_WageType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Wage_Type'] input").removeClass("input-disabled");
                            var OCFSLABB_AbsenceType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Absence_Type'] input").removeClass("input-disabled");
	                    }
	                }
	            } else { // If datepicker then set values from TSE data-date
	                var date = activeTS.attr('data-date')
	                $(element).attr('value', date)
	                $(element).val(setLocaleDateString(date))
	            }
	        })
	    }
	    // if (action === 'view') {
	    //    showTTTKFields();
	    // } else {
	    // 	showTTTKFields(false);
	    // }
	    //  code 33013
	    // showHrUpDownFields();
	    //  code 33013
	    // Code for 50834
	    // showAllowanceFields("edit");
	    var hrdown = country[userCountry].fields['HR_Down__c'];
	    var hrup = country[userCountry].fields['HR_Up__c'];
	    var timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c input:visible', timesheetEntry)
	    if (timeEntryType.length > 0 && hrup && (hrup['Display'] === "TRUE") && hrdown && (hrdown['Display'] === "TRUE")) {
	        showHrUpDownFields()
	    } else {
	        $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Up__c").hide()
	        $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Down__c").hide()
	    }
        var multipleTimesheetSec=$(ele).parents(".multiple-timesheet-entry")
        var multipleTimesheetSecHeight = multipleTimesheetSec.attr("data-height")
	   if(multipleTimesheetSec.hasClass("multiple-timesheet-entry")){
        multipleTimesheetSec.find(".inline-form-container").css("top",  multipleTimesheetSecHeight+"px" );
        multipleTimesheetSec.find(".inline-form-container").detach().insertAfter(multipleTimesheetSec)
       }

	    // if (action === 'view') {
	    //     timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c .value', timesheetEntry)
	    //     if(timeEntryType.attr('data-id') !== ""){
	    //         showHrUpDownFields()
	    //     }
	    // }
	    // if (action === 'view') {
	    //       showAllowanceFields("view");  
	    // } else {
	    //         showAllowanceFields('edit') 
	    // }
	    if (action != 'view') {
	        enableDisableButtons()
	    }
        if (action !== 'view'){
            enableAndDisableIcons()
        }
	}
	    }



function cloneInlineTimesheetEntry(ele) {
            var chkSAFlg = false;
            hideInlineTSE()
            selectedPickUp = ""
            selectedLookUp = ""
            inlineTsEntry = true;
            if($(ele).parents().hasClass('inline-icons-wraper')) {
                var timesheetSliderSFID = $(ele).closest('.timesheet-entry').attr('data-sfid')
            } else {
                var timesheetSliderSFID = $('#timesheet-entry-action-slider').attr('data-sfid')
            }
            if (setFeatureFlag) {
                var fetchTSEType = 'Select'
                var fetchTSEForGermany = {
                    'query': "Select Count() cnt from timesheetentry tse, serviceappointment sa where tse.FSLABB_ServiceAppointment_ref__c = sa.Id AND tse.id in ('" + timesheetSliderSFID + "') AND sa.Status in ('Completed','Canceled','Cannot Complete') and tse.RecordTypeid = '" + workOrderRelated + "'"
                }
                callJSAPI(fetchTSEType, fetchTSEForGermany, 'TimesheetEntry').then(function (data) {
                    if ((data && data[0].cnt > 0) || (saStatus == 'Completed' || saStatus == 'Canceled' || saStatus == 'Cannot Complete')) {
                        chkSAFlg = true;
                        $('#timesheet-entry-action-slider').removeClass('active')
                        finalSAStatus = true;
                        showDialogueBox('notification')
                        $('#pop-ups').addClass('active')
                    } else {
                            var timesheetToClone = $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]')
                            var timesheetEntryClone = timesheetToClone.clone(true, true)
                            var TimesheetEntryData = timesheetEntryClone.attr('data-ts-entry')
                            buildInlineTsEntry(TimesheetEntryData, timesheetToClone)
                            timesheetEntryClone = $('div.inline-form-container[data-sfid="' + timesheetSliderSFID + '"]')
                        timesheetEntryClone.removeClass('view edit clone create global_create').addClass('clone')
                            $('.tcolumn.action-inline-btn').hide()
                            $('.tcolumn.tcolumn_new').hide()
                            // Get the correct day - active day within active timesheet
                            var correctDay = $('.timesheet.active .day.active')
                            // Set status header
                            $('.title-value', timesheetEntryClone).text('Clone Timesheet Entry')
                        
                            activityTypePopulate(timesheetSliderSFID)
                            $('div.timesheet-entry-FSLABB_ActivityType__c div.value', timesheetEntryClone).attr('data-id', activityVar)
                            $('div.timesheet-entry-FSLABB_ActivityType__c input', timesheetEntryClone).attr('data-id', activityVar)
                        
                            // Delete sfid & date values
                            $(timesheetEntryClone).attr('data-sfid', '')
                            $('div.timesheet-entry-date div.value', timesheetEntryClone).text('')
                            $('div.timesheet-entry-date input', timesheetEntryClone).attr('value', '').attr('disabled', false)
                            $('div.timesheet-entry-date input', timesheetEntryClone).val('')
                            //$('div.timesheet-entry-date input', timesheetEntryClone).change()
                        
                            // Delete id on JQueryUI Date picker otherwise datepicker uses wrong field
                            $('div.timesheet-entry-date input', timesheetEntryClone).removeAttr('id')
                            $('div.timesheet-entry-date input', timesheetEntryClone).removeClass('hasDatepicker')
                        
                            // Swap class to new, add class active, & add context class
                            $(timesheetEntryClone).removeClass('new submitted rejected approved').addClass('new')
                            //$(timesheetEntryClone).addClass('active')
                        $(timesheetEntryClone).removeClass('view edit clone create global_create').addClass('clone')
                        
                            // Append clone into day-timesheet-entry-container
                            // $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]').parent().append(timesheetEntryClone)
                        
                            // Set the Launch View context
                            if ($('body').hasClass('view-day')) {
                                launchViewContext = 'view-day'
                                correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
                            } else if ($('body').hasClass('view-day-list')) {
                                launchViewContext = 'view-day-list'
                                correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
                            } else if ($('body').hasClass('view-timesheet-entry-status')) {
                                var date = timesheetEntryClone.attr('data-date')
                                correctDay = $(".timesheet.active .day[data-date='" + date + "']")
                                $('.timesheet.active .day.active').removeClass('active')
                                correctDay.addClass('active')
                                launchViewContext = 'view-timesheet-entry-status'
                            }
                        
                            // Check to see what fields need to be hidden/shown
                            // Check if the data has been changed, and enable the save button if so
                            showHideFields()
                            showTTTKFields()
                            buildSDLineItemLookup(timesheetEntryClone, false)
                            // Swap body class to view-timesheet-entry-edit and close any popups
                            //changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
                            $('.inline-form-container').css({ display: 'block' })
                            closePopUps()
                            // Focus on subject field
                            $('.timesheet-entry-subject input', timesheetEntryClone).focus()
                            enableDisableButtons()
                            //  code 33013
                            var hrdown = country[userCountry].fields['HR_Down__c'];
                            var hrup = country[userCountry].fields['HR_Up__c'];
                            var timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c input:visible', timesheetEntryClone)
                            if (timeEntryType.length > 0 && hrup && (hrup['Display'] === "TRUE") && hrdown && (hrdown['Display'] === "TRUE")) {
                                showHrUpDownFields()
                            } else {
                                $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Up__c").hide()
                                $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Down__c").hide()
                            }
                            showAllowanceFields('edit')
                        
                            $('input, textarea', timesheetEntryClone).each(function (index, element) {
                                if ($(element).hasClass('number')) {
                                    if ($(element).siblings('.value').text()) {
                                        // Code for 50834
                                        if (isNaN(parseFloat($(element).siblings('.value').text()))) {
                                            $(element).val($(element).siblings('.value').text())
                                        } else {
                                            $(element).val(parseFloat($(element).siblings('.value').text()).toFixed(2).replace(/\.00$/, ''))
                                            $(element).siblings(".value").text(parseFloat($(element).siblings('.value').text()).toFixed(2).replace(/\.00$/, ''))
                                        }
                                    }
                                }
                            if ($(element).hasClass('FSLABB_ABBOvertimeCategory__c__input')) {
                                var did = $(element).attr("data-id");
                                if (did && did != '') {
                                    var OCFSLABB_ActivityType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_ActivityType'] input").addClass("input-disabled");
                                    var OCFSLABB_WageType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Wage_Type'] input").addClass("input-disabled");
                                    var OCFSLABB_AbsenceType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Absence_Type'] input").addClass("input-disabled");
                                } else {
                                    var OCFSLABB_ActivityType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_ActivityType'] input").removeClass("input-disabled");
                                    var OCFSLABB_WageType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Wage_Type'] input").removeClass("input-disabled");
                                    var OCFSLABB_AbsenceType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Absence_Type'] input").removeClass("input-disabled");
                                }
                            }
                            })
                
                        enableAndDisableIcons()
                     }
                })
            } else {
                var timesheetToClone = $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]')
                var timesheetEntryClone = timesheetToClone.clone(true, true)
                var TimesheetEntryData = timesheetEntryClone.attr('data-ts-entry')
                buildInlineTsEntry(TimesheetEntryData, timesheetToClone)
                timesheetEntryClone = $('div.inline-form-container[data-sfid="' + timesheetSliderSFID + '"]')
                timesheetEntryClone.removeClass('view edit clone create global_create').addClass('clone')
                $('.tcolumn.action-inline-btn').hide()
                $('.tcolumn.tcolumn_new').hide()
                // Get the correct day - active day within active timesheet
                var correctDay = $('.timesheet.active .day.active')
                // Set status header
                $('.title-value', timesheetEntryClone).text('Clone Timesheet Entry')
            
                //activityTypePopulate(timesheetSliderSFID)
                //$('div.timesheet-entry-FSLABB_ActivityType__c div.value', timesheetEntryClone).attr('data-id', activityVar)
               // $('div.timesheet-entry-FSLABB_ActivityType__c input', timesheetEntryClone).attr('data-id', activityVar)
            
                // Delete sfid & date values
                $(timesheetEntryClone).attr('data-sfid', '')
                $('div.timesheet-entry-date div.value', timesheetEntryClone).text('')
                $('div.timesheet-entry-date input', timesheetEntryClone).attr('value', '').attr('disabled', false)
                $('div.timesheet-entry-date input', timesheetEntryClone).val('')
                //$('div.timesheet-entry-date input', timesheetEntryClone).change()
            
                // Delete id on JQueryUI Date picker otherwise datepicker uses wrong field
                $('div.timesheet-entry-date input', timesheetEntryClone).removeAttr('id')
                $('div.timesheet-entry-date input', timesheetEntryClone).removeClass('hasDatepicker')
            
                // Swap class to new, add class active, & add context class
                $(timesheetEntryClone).removeClass('new submitted rejected approved').addClass('new')
                //$(timesheetEntryClone).addClass('active')
                $(timesheetEntryClone).removeClass('view edit clone create global_create').addClass('clone')
            
                // Append clone into day-timesheet-entry-container
                // $('div.timesheet-entry[data-sfid="' + timesheetSliderSFID + '"]').parent().append(timesheetEntryClone)
            
                // Set the Launch View context
                if ($('body').hasClass('view-day')) {
                    launchViewContext = 'view-day'
                    correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
                } else if ($('body').hasClass('view-day-list')) {
                    launchViewContext = 'view-day-list'
                    correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
                } else if ($('body').hasClass('view-timesheet-entry-status')) {
                    var date = timesheetEntryClone.attr('data-date')
                    correctDay = $(".timesheet.active .day[data-date='" + date + "']")
                    $('.timesheet.active .day.active').removeClass('active')
                    correctDay.addClass('active')
                    launchViewContext = 'view-timesheet-entry-status'
                }
            
                // Check to see what fields need to be hidden/shown
                // Check if the data has been changed, and enable the save button if so
                showHideFields()
               // showTTTKFields()
                buildSDLineItemLookup(timesheetEntryClone, false)
                // Swap body class to view-timesheet-entry-edit and close any popups
                //changeBodyClass('view-day view-day-list view-timesheet-entry-status', 'view-timesheet-entry-edit')
                $('.inline-form-container').css({ display: 'block' })
                closePopUps()
                // Focus on subject field
                $('.timesheet-entry-subject input', timesheetEntryClone).focus()
                enableDisableButtons()
                //  code 33013
                var hrdown = country[userCountry].fields['HR_Down__c'];
                var hrup = country[userCountry].fields['HR_Up__c'];
                var timeEntryType = $('.timesheet-entry-FSLABB_TimeEntryType__c input:visible', timesheetEntryClone)
                if (timeEntryType.length > 0 && hrup && (hrup['Display'] === "TRUE") && hrdown && (hrdown['Display'] === "TRUE")) {
                    showHrUpDownFields()
                } else {
                    $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Up__c").hide()
                    $(".inline-timesheet-entry-table .timesheet-entry-FSLABB_HR_Down__c").hide()
                }
               // showAllowanceFields('edit')
            
                $('input, textarea', timesheetEntryClone).each(function (index, element) {
                    if ($(element).hasClass('number')) {
                        if ($(element).siblings('.value').text()) {
                            // Code for 50834
                            if (isNaN(parseFloat($(element).siblings('.value').text()))) {
                                $(element).val($(element).siblings('.value').text())
                            } else {
                                $(element).val(parseFloat($(element).siblings('.value').text()).toFixed(2).replace(/\.00$/, ''))
                                $(element).siblings(".value").text(parseFloat($(element).siblings('.value').text()).toFixed(2).replace(/\.00$/, ''))
                            }
                        }
                    }
                    if ($(element).hasClass('FSLABB_ABBOvertimeCategory__c__input')) {
                        var did = $(element).attr("data-id");
                        if (did && did != '') {
                            var OCFSLABB_ActivityType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_ActivityType'] input").addClass("input-disabled");
                            var OCFSLABB_WageType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Wage_Type'] input").addClass("input-disabled");
                            var OCFSLABB_AbsenceType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Absence_Type'] input").addClass("input-disabled");
                        } else {
                            var OCFSLABB_ActivityType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_ActivityType'] input").removeClass("input-disabled");
                            var OCFSLABB_WageType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Wage_Type'] input").removeClass("input-disabled");
                            var OCFSLABB_AbsenceType__c_field = $("div.timesheet-entry.active div[data-sfapi='FSLABB_Absence_Type'] input").removeClass("input-disabled");
                        }
                    }
                    var multipleTimesheetSec=$(ele).parents(".multiple-timesheet-entry")
                    var multipleTimesheetSecHeight = multipleTimesheetSec.attr("data-height")
                   if(multipleTimesheetSec.hasClass("multiple-timesheet-entry")){
                    multipleTimesheetSec.find(".inline-form-container").css("top",  multipleTimesheetSecHeight+"px" );
                    multipleTimesheetSec.find(".inline-form-container").detach().insertAfter(multipleTimesheetSec)
                   }
                })
                enableAndDisableIcons()
            }
        }

        function getLabourCode(codeId) {
            var codeData = picklistData['FSLABB_Currency__c']
            var codeIds = codeData.itemIds
            var codeIndex = codeIds.indexOf(codeId)
            var codeReturnVal = codeData.itemLabels[codeIndex]
            return codeReturnVal
        }
        
        function getTimeEntry(codeId) {
            var codeData = picklistData['FSLABB_TimeEntryType__c']
            var codeIds = codeData.itemIds
            var codeIndex = codeIds.indexOf(codeId)
            var codeReturnVal = codeData.itemLabels[codeIndex]
            return codeReturnVal
        }



// timesheet-entry-action-slider delete functionality
function deleteTimesheetEntry(ele) {
var timesheetDataSFID =  $(ele).closest('#timesheet-entry-action-slider').attr('data-sfid')
    var timesheetSubject = $('#timesheet-entry-action-slider div.timesheet-entry-subject div.value').text()
    $('#confirmation-warning-delete .tseSubject').text(timesheetSubject)
    var timesheetEntryStartTime = $('#timesheet-entry-action-slider div.timesheet-entry-start div.value').text()
    $('#confirmation-warning-delete .tseStartTime').text(timesheetEntryStartTime)
    var timesheetEntryEndTime = $('#timesheet-entry-action-slider div.timesheet-entry-end div.value').text()
    $('#confirmation-warning-delete .tseEndTime').text(timesheetEntryEndTime)
$('#confirmation-warning-delete').attr('data-sfid', timesheetDataSFID)
    $('#confirmation-warning-delete').addClass('active')
    $('#timesheet-entry-action-slider').removeClass('active')
}
function deleteInlineTimesheetEntry(ele) {
    var timesheetDataSFID =  $(ele).closest('.timesheet-entry').attr('data-sfid')
    var timesheetDataStart =  $(ele).closest('.timesheet-entry').attr('data-start-time')

    var chkSAFlg = false;
    if($(ele).hasClass('delete-reject')) {
        var timesheetEntry =  $(ele).parents('.inline-form-container').prev('div.timesheet-entry')
    } else {
    	var timesheetEntry = $(ele).closest('.timesheet-entry')
    } 
    var timesheetEntryStartTime = $('div.timesheet-entry-content div.timesheet-entry-start-time div.value', timesheetEntry).text()
    var timesheetEntryEndTime = $('div.timesheet-entry-content div.timesheet-entry-end-time div.value', timesheetEntry).text()

    var timesheetSubject = $('div.timesheet-entry-content div.timesheet-entry-subject div.value', timesheetEntry).text()
    $('#confirmation-warning-delete .tseSubject').text(timesheetSubject)
   // var timesheetEntryStartTime = $('div.timesheet-entry-content div.timesheet-entry-start div.value', timesheetEntry).text()
    $('#confirmation-warning-delete .tseStartTime').text(timesheetEntryStartTime)
   // var timesheetEntryEndTime = $('div.timesheet-entry-content div.timesheet-entry-end div.value', timesheetEntry).text()
    $('#confirmation-warning-delete .tseEndTime').text(timesheetEntryEndTime)
    $('#confirmation-warning-delete').attr('data-sfid', timesheetDataSFID)
    $('#confirmation-warning-delete').attr('data-start-time', timesheetDataStart)
    $('#confirmation-warning-delete').addClass('active')
    $('#overlay').addClass('active')    
}
// timesheet-entry-action-slider delete functionality
function deleteTimesheetEntrySubmit() {
    //hideInlineTSE()
	//changeBodyClass('view-timesheet-entry view-timesheet-entry-edit', launchViewContext)
    var timesheetEntrySFID = $('#confirmation-warning-delete').attr('data-sfid')
    // Only returns dummy data time sheet entry
    var deleteResult = callJSAPI('delete', { 'Id': timesheetEntrySFID }, 'TimeSheetEntry')

    // Get timesheet entry, timesheet entry duration, & related
    var tse = $('div.timesheet-entry[data-sfid="' + timesheetEntrySFID + '"]')
    // Remove timesheet entry DOM
    tse.remove()


    // Sort the timesheet entries for this timesheet only
    sortTimesheetEntries(true)
    // Update the Days Totals
    updateTimesheetTotals(true)
    // Re-initialize timesheet charts
    chartHeightsAndInitialize(true)

    // Close pop-up, toggle overlay
    closePopUps()
}
function submitTimesheetEntry(context) {
    // Create array for sfids
    hideInlineTSE()
    var submitTSE
    var submitSFID = []

    // If 'Submit All' button is pressed determine if it's pressed from timesheet or day view
    if (context == 'submitAll') {
        if ($('div.timesheet.active div.day.active').length) {
            context = 'day'
        } else {
            context = 'timesheet'
        }
    }

    // Determine if timesheet, day, or entry
    if (context == 'timesheet') {
        // Get a list of sfids for all TSE’s with Status =’New’ or 'Rejected' within active Timesheet
        // submitTSE = $('div.timesheet.active div.timesheet-entry.new, div.timesheet.active div.timesheet-entry.rejected')
        // only new and active timesheets allowed to submit
        submitTSE = $('div.timesheet.active div.timesheet-entry.new, div.timesheet.active')
        submitTSE.map(function () {
            submitSFID.push($(this).attr('data-sfid'))
        })
    } else if (context == 'submitAllWeeks') {
        submitTSE = $('div.timesheet div.timesheet-entry.new, div.timesheet')
        submitTSE.map(function () {
            if ($(this).attr('data-sfid') != undefined && $(this).attr('data-sfid') != '') {
                submitSFID.push($(this).attr('data-sfid'))
            }
        })
        // submitAllowanceForAllWeeks(submitSFID.join(','))
    } else if (context == 'day') {
        // Get a list of sfids for all TSE’s with Status =’New’ or 'Rejected' within active Day
        // submitTSE = $('div.timesheet.active div.day.active div.timesheet-entry.new, div.timesheet.active div.day.active div.timesheet-entry.rejected')
        submitTSE = $('div.timesheet.active div.day.active div.timesheet-entry.new, div.timesheet.active div.day.active')
        submitTSE.map(function () {
            submitSFID.push($(this).attr('data-sfid'))
        })
    } else if (context == 'entry' || context == 'resubmit') {
        // Get sfid from #timesheet-entry-action-slider
        submitSFID.push($('#timesheet-entry-action-slider').attr('data-sfid'))
        submitTSE = $('div.timesheet-entry[data-sfid=' + submitSFID[0] + ']')
    } else {
        return // Do nothing if incorrect context
    }

    // If there is nothing in list there is no tse to submit
    if (submitSFID.length < 1) { return }

    // Get sfid list ready for soql statement
    var submitSFIDSOQL = submitSFID.map(function (sfid) {
        return "'" + sfid + "'"
    }).join(',')

    if ($('body').hasClass('view-day')) {
        launchViewContext = 'view-day'
    } else if ($('body').hasClass('view-day-list')) {
        launchViewContext = 'view-day-list'
    } else if ($('body').hasClass('view-timesheet-entry-status')) {
        launchViewContext = 'view-timesheet-entry-status'
    } else {
        launchViewContext = 'view-timesheets'
    }
    // Display processing data
    // $('body').removeClass(launchViewContext)
    // $('body').addClass('view-processing')
    changeBodyClass(launchViewContext, 'view-processing')
    // Call Pulsar with JSAPI to update each tse in salesforce
    var rType = 'updateQuery'
    var rData = { 'query': 'UPDATE TimeSheetEntry SET Status = "Submitted" WHERE Id IN (' + submitSFIDSOQL + ')' }
    var rObject = 'TimesheetEntry'

    callJSAPI(rType, rData, rObject).then(function (results) {
        logToConsole(`UPDATETSE: ${JSON.stringify(results)}`)
        submitTSE.map(function () {
            // Update tse class to submitted
            $(this).removeClass('new rejected').addClass('submitted')
        })

        //sort before update

        // Sort the timesheet entries for this timesheet only
        context == 'submitAllWeeks' ? sortTimesheetEntries(false) : sortTimesheetEntries(true)
        // Update the Days Totals
        context == 'submitAllWeeks' ? updateTimesheetTotals(false) : updateTimesheetTotals(true)
        // Update timesheet-entry-status charts for the active Timesheet
        context == 'submitAllWeeks' ? chartHeightsAndInitialize(false) : chartHeightsAndInitialize(true)
        // Close pop-up, toggle overlay
        closePopUps()
        // Hide processing and return to launch view
        // $('body').removeClass('view-processing')
        // $('body').addClass(launchViewContext)
        changeBodyClass('view-processing', launchViewContext)
    }).catch(function (error) {
        logToConsole(`ERROR UPDATETSE: ${JSON.stringify(error)}`)
    })
}
// Timesheet entry submit function
function submitTimesheetLineEntry(ele, context) {
    // Create array for sfids
    hideInlineTSE()
    var submitTSE
    var submitSFID = []

    // If 'Submit All' button is pressed determine if it's pressed from timesheet or day view
    if (context == 'submitAll') {
        if ($('div.timesheet.active div.day.active').length) {
            context = 'day'
        } else {
            context = 'timesheet'
        }
    }

    // Determine if timesheet, day, or entry
    if (context == 'timesheet') {
        // Get a list of sfids for all TSE’s with Status =’New’ or 'Rejected' within active Timesheet
        // submitTSE = $('div.timesheet.active div.timesheet-entry.new, div.timesheet.active div.timesheet-entry.rejected')
        // only new and active timesheets allowed to submit
        submitTSE = $('div.timesheet.active div.timesheet-entry.new, div.timesheet.active')
        submitTSE.map(function () {
            submitSFID.push($(this).attr('data-sfid'))
        })
    } else if (context == 'submitAllWeeks') {
        submitTSE = $('div.timesheet div.timesheet-entry.new, div.timesheet')
        submitTSE.map(function () {
            if ($(this).attr('data-sfid') != undefined && $(this).attr('data-sfid') != '') {
                submitSFID.push($(this).attr('data-sfid'))
            }
        })
        // submitAllowanceForAllWeeks(submitSFID.join(','))
    } else if (context == 'day') {
        // Get a list of sfids for all TSE’s with Status =’New’ or 'Rejected' within active Day
        // submitTSE = $('div.timesheet.active div.day.active div.timesheet-entry.new, div.timesheet.active div.day.active div.timesheet-entry.rejected')
        submitTSE = $('div.timesheet.active div.day.active div.timesheet-entry.new, div.timesheet.active div.day.active')
        submitTSE.map(function () {
            submitSFID.push($(this).attr('data-sfid'))
        })
    } else if (context == 'entry' || context == 'resubmit') {
        // Get sfid from #timesheet-entry-action-slider
        submitSFID.push($(ele).closest('.timesheet-entry').attr('data-sfid'))
        submitTSE = $('div.timesheet-entry[data-sfid=' + submitSFID[0] + ']')
    } else {
        return // Do nothing if incorrect context
    }

    // If there is nothing in list there is no tse to submit
    if (submitSFID.length < 1) { return }

    // Get sfid list ready for soql statement
    var submitSFIDSOQL = submitSFID.map(function (sfid) {
        return "'" + sfid + "'"
    }).join(',')

    if ($('body').hasClass('view-day')) {
        launchViewContext = 'view-day'
    } else if ($('body').hasClass('view-day-list')) {
        launchViewContext = 'view-day-list'
    } else if ($('body').hasClass('view-timesheet-entry-status')) {
        launchViewContext = 'view-timesheet-entry-status'
    } else {
        launchViewContext = 'view-timesheets'
    }
    // Display processing data
    // $('body').removeClass(launchViewContext)
    // $('body').addClass('view-processing')
    showProcessLoader()
    // Call Pulsar with JSAPI to update each tse in salesforce
    var rType = 'updateQuery'
    var rData = { 'query': 'UPDATE TimeSheetEntry SET Status = "Submitted" WHERE Id IN (' + submitSFIDSOQL + ')' }
    var rObject = 'TimesheetEntry'

    callJSAPI(rType, rData, rObject).then(function (results) {
        logToConsole(`UPDATETSE: ${JSON.stringify(results)}`)
        submitTSE.map(function () {
            // Update tse class to submitted
            $(this).removeClass('new rejected').addClass('submitted')
        })

        //sort before update

        // Sort the timesheet entries for this timesheet only
        context == 'submitAllWeeks' ? sortTimesheetEntries(false) : sortTimesheetEntries(true)
        // Update the Days Totals
        context == 'submitAllWeeks' ? updateTimesheetTotals(false) : updateTimesheetTotals(true)
        // Update timesheet-entry-status charts for the active Timesheet
        context == 'submitAllWeeks' ? chartHeightsAndInitialize(false) : chartHeightsAndInitialize(true)
        // Close pop-up, toggle overlay
        closePopUps()
        // Hide processing and return to launch view
        // $('body').removeClass('view-processing')
        // $('body').addClass(launchViewContext)
        hideProcessLoader()
    }).catch(function (error) {
        logToConsole(`ERROR UPDATETSE: ${JSON.stringify(error)}`)
    })
}

function generatePDF() {
    let timesheetId = $('div.timesheet.active').attr('data-sfid')
    let type = 'updateQuery'
    let data = { 'query': `UPDATE TimeSheet SET FSLABB_Send_Weekly_TSE_PDF__c = "true" WHERE Id = "${timesheetId}"` }
    let object = 'TimeSheet'

    callJSAPI(type, data, object).then((results) => {
        logToConsole(`generatePDF results: ${JSON.stringify(results)}`)
        showDialogueBox('pdf-sent')
        //  $('#overlay').addClass('active')
        //  $('#pdf-sent').addClass('active')
    })
}

function openDatePicker(ele) {
    $(ele).attr('disabled', 'disabled') // disable the field to prevent keyboard entry
    var mindate = $('.timesheet.active').attr('data-startDate')
    var maxdate = $('.timesheet.active').attr('data-endDate')
    var currentdate = $(ele).siblings('.value').text()
    var datePickerPopUp = $(ele)

    datePickerPopUp.datepicker({
        'dateFormat': 'yy-mm-dd',
        'minDate': mindate,
        'maxDate': maxdate,
        'defaultDate': currentdate,
        'onSelect': function (dateText, inst) {
            closePopUps()
            $(ele).val(setLocaleDateString(dateText))
            $(ele).attr('value', dateText)
            $(ele).change()
if($(".day").hasClass("global_inline")){
                $(".global_inline").attr("data-date",dateText) 
            }
        }
    })
    $('#overlay').addClass('active')

    datePickerPopUp.datepicker('show')
    if (!$('.ui-datepicker').find('#input_header').length) {
        $('.ui-datepicker').prepend('<div id="input_header" class="ui-datepicker_title">Select date<span>' + $(ele).val() + '</span><div/>')
    }
    if (!$('.ui-datepicker').find('#input_footer').length) {
        $('.ui-datepicker').append('<div id="input_footer" class="ui-datepicker_footer"><button>Cancel</button>')
        $('#input_footer').on('click', function () { closePopUps(); datePickerPopUp.datepicker('hide') })
    }

    $(document).on('click', 'a.ui-corner-all', function () {
        if (!$('.ui-datepicker').find('#input_header').length) {
            $('.ui-datepicker').prepend('<div id="input_header" class="ui-datepicker_title">Select date<span>' + $(ele).val() + '</span><div/>')
        }
        if (!$('.ui-datepicker').find('#input_footer').length) {
            $('.ui-datepicker').append('<div id="input_footer" class="ui-datepicker_footer"><button>Cancel</button>')
            $('#input_footer').on('click', function () { closePopUps(); datePickerPopUp.datepicker('hide') })
        }
    })
}

function setLocaleDateString(date) {
    // converts from yyyy-mm-dd to whatever the format the user uses
    var parts = date.split('-')
    var myDate = new Date(parts[0], parts[1] - 1, parts[2])
    var formattedDate = myDate.toLocaleDateString(userLocale, { 'day': '2-digit', 'month': '2-digit', 'year': 'numeric' })
    return formattedDate
}

// full day clone functionality starts 
function validateDays(){
    if($('#clone-days').val() !=='' && (parseInt($('#clone-days').val()) <= 14 && parseInt($('#clone-days').val()) >= 1)  && $('#clone-data-date').val() !==""){
        $('#timepicker-ok-clone').removeClass('not-active')
    } else {
        $('#timepicker-ok-clone').addClass('not-active')
    } 
}

function openCloneDatePicker(ele) {
    var activeTsheetObj
    let availableDates = []
    $(ele).attr('disabled', 'disabled')
    $("#clone-date").css("z-index", "-1");
    $(ele).attr('disabled', 'disabled') // disable the field to prevent keyboard entry
   
    let allTImeSheets = document.getElementById('timesheets-container').getElementsByClassName("timesheet");
    activeTsheetObj = _.find(allTImeSheets, function(item) {
        let startDate = new Date(item.dataset.startdate);
        let endDate = new Date(item.dataset.enddate);
        availableDates.push(startDate)
        availableDates.push(endDate)
    })
    const mindateClone = availableDates.reduce((acc,date)=>{return acc&&new Date(acc)<new Date(date)?acc:date},'')
    const maxdateClone = availableDates.reduce((acc,date)=>{return acc&&new Date(acc)>new Date(date)?acc:date},'')
    var currentdate = $(ele).siblings('.value').text()
    var datePickerPopUp = $(ele)

    datePickerPopUp.datepicker({
        'dateFormat': 'yy-mm-dd',
        'minDate': mindateClone,
        'maxDate': maxdateClone,
        'defaultDate': currentdate,
        'onSelect': function(dateText, inst) {
            closePopUps()
            $('#overlay').addClass('active')
            $("#clone-date").removeAttr('style');
            $('#clone-date').addClass('active')
			validateDays()
            $(ele).val(setLocaleDateString(dateText))
            $(ele).attr('value', dateText)
            $(ele).change()
        }
    })
    $('#overlay').addClass('active')

    datePickerPopUp.datepicker('show')
    if (!$('.ui-datepicker').find('#input_header').length) {
        $('.ui-datepicker').prepend('<div id="input_header" class="ui-datepicker_title">Select date<span>' + $(ele).val() + '</span><div/>')
    }
    if (!$('.ui-datepicker').find('#input_footer').length) {
        $('.ui-datepicker').append('<div id="input_footer" class="ui-datepicker_footer"><button>Cancel</button>')
        $('#input_footer').on('click', function() {
            closePopUps();
            datePickerPopUp.datepicker('hide');
            $("#clone-date").removeAttr('style');
        })
    }

    $(document).on('click', 'a.ui-corner-all', function() {
        if (!$('.ui-datepicker').find('#input_header').length) {
            $('.ui-datepicker').prepend('<div id="input_header" class="ui-datepicker_title">Select date<span>' + $(ele).val() + '</span><div/>')
        }
        if (!$('.ui-datepicker').find('#input_footer').length) {
            $('.ui-datepicker').append('<div id="input_footer" class="ui-datepicker_footer"><button>Cancel</button>')
            $('#input_footer').on('click', function() {
                closePopUps();
                datePickerPopUp.datepicker('hide')
            })
        }
    })
}

// full day clone functionality ends


function setTimeField() {
    // get field from title set on open
    const timefield = $('input', '.timesheet-entry.active .timesheet-entry-' + $('#timepicker-description').text().toLowerCase() + '-time')
    const hours = $('#time-picker-hours').val()
    const minutes = $('#time-picker-minutes').val()
    selectedTimePicker.val(`${hours}:${minutes}`).change()
    closePopUps()
}

function timePickerHourOnChange() {
    const timefield = $('#timepicker-description').text().toLowerCase() // get field from title set on open
    $('option', '#time-picker-minutes').prop('disabled', false) // enable all minute options by default

    // if the selected hour is 24
    if ($('option:selected', '#time-picker-hours').val() === '24') {
        $('#time-picker-minutes').val('00').change()
        $('#time-picker-minutes').prop('disabled', true) // disable minute selection 
        return // and jump out
    } else {
        if (!$('option:selected', '#time-picker-minutes').val()) {
            $('#time-picker-minutes').val('00').change()
        }
        $('#time-picker-minutes').prop('disabled', false) // enable minute selection        
    }

    const date = $('input', tsElement+' .timesheet-entry-date').attr('value')
    const blockedTimeSlots = getBlockedTimeSlots(date)
        restrictTimePickerMinutes(timefield, blockedTimeSlots, date)

    if ($('option:selected', '#time-picker-minutes').prop('disabled')) { // if the currently selected minute is no longer enabled
        // apply the default, which is setting the first enabled option
        $('#time-picker-minutes').val($("#time-picker-minutes > :not(:disabled)").eq(0).val()).change()
    } else { // still need to check if minutes are valid
        timePickerMinuteOnChange()
    }
}

function timePickerMinuteOnChange() {
    if ($('#time-picker-hours').val() && $('#time-picker-minutes').val()) { // if we have got both hours and minutes set enable OK button
        $('#timepicker-ok').removeClass('not-active')
    } else { // else disable it
        $('#timepicker-ok').addClass('not-active')
    }
}

// full day clone starts
function openCloneTimesheetPopup(activeCloneDate) {
    var chkSAFlg = false;
    if (setFeatureFlag){
        if(saStatus == 'Completed' || saStatus == 'Canceled' || saStatus =='Cannot Complete'){
            chkSAFlg = true;
            checkSAStatus();
        }
        else{
            chkSAFlg = false;
        }
    }
    else{
        chkSAFlg =false;
    }

    if(!chkSAFlg){
    $('#overlay').addClass('active')
    $('#clone-date').addClass('active')
    $('#timepicker-ok-clone').attr('data-date',activeCloneDate)
    $("#clone-date").removeAttr('style');
    }
}

// full day clone ends

function openTimePicker(field, timefield) {
    $(field).attr('disabled', 'disabled') // disable the field to prevent keyboard entry
    selectedTimePicker = $(field);
    $('#overlay').addClass('active')
    $('#timepicker-description').text(timefield) // set title

    if (timefield === 'End') { // make sure the option for hour 24 is present
        if (!$('#time-picker-hours').find('option[value=24]').length) {
            $('#time-picker-hours').append('<option id="hour-24" value="24">24</option>')
        }
    } else { // remove the option for hour 24
        $("#time-picker-hours option[value=24]").remove()
    }

    $('#time-picker-hours').val($(field).val().substring(0, 2)).change() // set hour to that of launching field
    $('#time-picker-minutes').val($(field).val().substring(3, 5)).change() // set minute to that of launching field
    $('option', '#timepicker').prop('disabled', false) // show all hour and minute options by default
    const date = $('input', tsElement+' .timesheet-entry-date').attr('value')
    const blockedTimeSlots = getBlockedTimeSlots(date)
        //console.log('blocked time' + blockedTimeSlots)
    restrictTimePickerHours(timefield.toLowerCase(), blockedTimeSlots, date)
    restrictTimePickerMinutes(timefield.toLowerCase(), blockedTimeSlots, date)
    $('#timepicker').addClass('active')
    // if the selected hour is 24
    if ($('option:selected', '#time-picker-hours').val() === '24') {
        $('#time-picker-minutes').prop('disabled', true) // disable minute selection 
    }
}

function restrictTimePickerHours(timefield, blockedTimeSlots, date) {
    if (timefield === 'end') { // disable hours outside the period between the starthour and the first blocked timeslot
        if(inlineTsEntry){
            tsElement = '.inline-timesheet-entry-table .trow:last'
        } else {
            tsElement =  '.timesheet-entry.active'
        }
        const startTimeString = $('input', tsElement+' .timesheet-entry-start-time').val()
        const startMoment = moment(`${date}T${startTimeString}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
        const lastMinute = parseInt($('#time-picker-minutes option').last().val())
        const firstBlockAhead = blockedTimeSlots.find(slot => slot.startTime > startMoment)
        $('#time-picker-hours option').filter(function () {
            const thisHour = parseInt($(this).val())
            return thisHour < startMoment.hour() // thisHour is before the start
                || thisHour === startMoment.hour() && lastMinute === startMoment.minute() // no minutes left in this hour
            //  || firstBlockAhead && thisHour > firstBlockAhead.startTime.hour() // thisHour is after the first blocked slot
        }).prop('disabled', true)
    } /*else { // disable hours inside a blocked timeslot
        $('#time-picker-hours option').filter(function () {
            const thisHour = parseInt($(this).val())
            return blockedTimeSlots.find(slot =>
                thisHour > slot.startTime.hour() && thisHour < slot.endTime.hour() // thisHour is inside a blocked slot
                || thisHour === slot.startTime.hour() && slot.startTime.minute() === 0 && thisHour < slot.endTime.hour() // thisHour is at the start of a blocked slot
            )
        }).prop('disabled', true)
    }*/
}

function restrictTimePickerMinutes(timefield, blockedTimeSlots, date) {
    const timePickerHour = parseInt($('#time-picker-hours').val())
    if (timefield === 'end') { // end time picker
        if(inlineTsEntry){
            tsElement = '.inline-timesheet-entry-table .trow:last'
        } else {
            tsElement =  '.timesheet-entry.active'
        }
        const startTimeString = $('input', tsElement+' .timesheet-entry-start-time').val()
        const startMoment = moment(`${date}T${startTimeString}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
        if (startMoment.hour() === timePickerHour) { // if the end hour is the same as the start hour
            $('#time-picker-minutes option').filter(function () {
                // disable all minutes before the start minute
                return parseInt($(this).val()) <= startMoment.minute()
            }).prop('disabled', true)
        }
        // if we don't have any blocked time slots jump out
        if (!blockedTimeSlots.length) return
        // search for the first blocked slot during this hour and after the start
        const firstBlockAhead = blockedTimeSlots.find(slot => slot.startTime.hour() === timePickerHour && slot.startTime > startMoment)
        // disable minutes outside the period between the start time and the first blocked timeslot
        if (firstBlockAhead) {
            const firstBlockedMinute = firstBlockAhead.startTime.minute()
            $('#time-picker-minutes :not(:disabled)').filter(function () {
                const thisMinute = parseInt($(this).val())
                return thisMinute > firstBlockedMinute
            }).prop('disabled', true)
        }
    } /*else { // start time picker
        // if we don't have any blocked time slots jump out
        if (!blockedTimeSlots.length) return
        // disable all blocked minutes
        const minute = moment(date, 'YYYY-MM-DD', true).hour(timePickerHour)
        $('#time-picker-minutes :not(:disabled)').filter(function () {
            minute.minute(parseInt($(this).val()))
            return blockedTimeSlots.find(slot => minute >= slot.startTime && minute < slot.endTime)
        }).prop('disabled', true)
    }*/
}

/**
* Produces a simplified list of blocked times slots (already included in a TSE)
*
* @param {string} date - List TSEs for this date (YYYY-MM-DD format)
*/
function getBlockedTimeSlots(date) { //
    // Get all TSEs on the correct day apart from the current (active) one
    const allTSEs = $('.timesheet-entry:not(.active)', `.day[data-date='${date}']`)

    // Get valid TSE keys and return a simpler object list
    const blockedTimeSlots = Object.keys(allTSEs)
        .filter(value => Number.isInteger(parseInt(value)))
        .map(key => {
            return {
                'startTime': moment($(allTSEs[key]).attr('data-start-time')),
                'endTime': moment($(allTSEs[key]).attr('data-end-time'))
            }
        })

    // Sort the time blocks
    // TODO Is this really necessary? TSEs seem to always be ordered
    blockedTimeSlots.sort((a, b) => a.startTime - b.startTime)

    // return after concatenating contiguous time blocks
    // if the difference between their start and end is a minute or less they're contiguous
    return blockedTimeSlots.reduce((acc, cur) => {
        if (acc.length === 0) return [cur]
        const last = acc.pop()
        if (cur.startTime.diff(last.endTime, 'minutes') <= 1) {
            return [...acc, { 'startTime': last.startTime, 'endTime': cur.endTime }]
        } else {
            return [...acc, last, cur]
        }
    }, [])
}

function toggleCheckbox(checkbox) {
    if ($(checkbox).attr('value') == 'TRUE') { $(checkbox).attr('value', 'FALSE') } else { $(checkbox).attr('value', 'TRUE') }
    enableDisableButtons()
}
function toggleAllowenceCheckbox(checkbox) {
    var activeTSE = $('div.timesheet.active div.day.active div.timesheet-entry.active')
    if ($(checkbox).prop("checked") == true) {
        $("div[data-dependentKey='FSLABB_Allowance__c']", activeTSE).css("display", "")
    }
    else if ($(checkbox).prop("checked") == false) {
        $("div[data-dependentKey='FSLABB_Allowance__c']", activeTSE).hide()
    }

}
function enableDisableButtons() {
    if(inlineTsEntry){
        tsElement = '.inline-timesheet-entry-table .trow:last'
    } else {
        tsElement =  '.timesheet-entry.active'
    }
    const startTime = $('input', tsElement+' .timesheet-entry-start-time').val()
    const endTime = $('input', tsElement+' .timesheet-entry-end-time').val()
    var startMoment = moment(startTime, 'hh:mm')
    var endMoment = moment(endTime, 'hh:mm')
    if (endMoment <= startMoment) {
        $('button.next', tsElement).attr('disabled', true)
    } else if (isActiveTimesheetEntryDataDirty() && areMandatoryFilled()) { // if data has changed and all mandatory fields are filled enable the next buttons
        $('button.next', tsElement).attr('disabled', false)
    } else {
        $('button.next', tsElement).attr('disabled', true)
    }
    if (inlineTsEntry) {
        if ($('.inline-timesheet-entry-table .trow:last').find('.add-inline-btn').is(":disabled") === false || $('.inline-timesheet-entry-table .trow.tbody').length > 1) {
            $('button.inline-save-btn').attr('disabled', false)
    } else {
            $('button.inline-save-btn').attr('disabled', true)
        }
    }
}

/**
* On Change Event handler for date field
* Checks if values for start time and end time overlap with any blocked slot in the new date
*
* @param {object} ele - the html element
*/
function dateOnChange(ele) {
    // get all the data
    const startTime = $('input', tsElement+' .timesheet-entry-start-time').val()
    const endTime = $('input', tsElement+' .timesheet-entry-end-time').val()
    const date = $('input', tsElement+' .timesheet-entry-date').attr('value')
    const startMoment = moment(`${date}T${startTime}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
    const endMoment = moment(`${date}T${endTime}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
    const blockedTimeSlots = getBlockedTimeSlots(date)
    // try to find an overlaping time slot
    const overlappingSlot = blockedTimeSlots.find(slot => startMoment < slot.endTime && endMoment > slot.startTime)
    // if it exists clear both the start and end time
    if (overlappingSlot) {
        $('input', tsElement+' .timesheet-entry-start-time').val('').change() // clear the start time
        $('input', tsElement+' .timesheet-entry-end-time').val('').change() // clear the end time
    }
    enableDisableButtons()
}

/**
* On Change Event handler for start time field
ª Checks if end time is still valid after the change
*
* @param {object} ele - the html element
*/
function startTimeOnChange() {

    if (!isValidEndTime()) { // if end time is invalid for this day
        $('input', '.timesheet-entry.active .timesheet-entry-end-time').val('').change() // clear the end time
    }
    enableDisableButtons()
}

function isValidEndTime() {
    const startTime = $('input', tsElement+' .timesheet-entry-start-time').val()
    const endTime = $('input', tsElement+' .timesheet-entry-end-time').val()
    var startMoment = moment(startTime, 'hh:mm')
    var endMoment = moment(endTime, 'hh:mm')
    // Date is not present at the time of cloning timesheet
    if (endMoment <= startMoment) {
        return false
    } else {
        const date = $('input', tsElement+' .timesheet-entry-date').attr('value')
        const blockedTimeSlots = getBlockedTimeSlots(date)
        startMoment = moment(`${date}T${startTime}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
        endMoment = moment(`${date}T${endTime}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
        return !blockedTimeSlots.find(slot => startMoment < slot.endTime && endMoment > slot.startTime)
    }
}

function openLookup(field, lookup, flag) {
    selectedPickUp = ''
    selectedLookUp = $(field)
    if(flag == 'type1') { //type1 - My-time & Allowance
    // If the lookup is a SA, filter accordingly
    if (lookup == 'FSLABB_ServiceAppointment') {
        // If there is only one row then there is no need for a popup, and the field has been populated, so return
        var oneRow = filterLookupSA()
        if (oneRow) { return }
    }

    $(field).attr('disabled', 'disabled') // disable the field to prevent keyboard entry
    // Determine name and id for tse and insert into html
    var lookupValue = $(field).attr('value')
    $('#' + lookup + ' input').attr('value', lookupValue)

    //	Open Lookup (#lookup) and overlay
    var popup = $('#' + lookup)
    $(popup).toggleClass('active')
    $('#overlay').toggleClass('active')
    }
    else if(flag == 'type2') { // type2 - checklist
    $(field).attr('disabled', 'disabled') // disable the field to prevent keyboard entry
    // Determine name and id for tse and insert into html
    var lookupValue = $(field).attr('value')
    $('#' + lookup + ' input').attr('value', lookupValue)
    //Open Lookup (#lookup) and overlay
    var popup = $('#' + lookup)
    $(popup).toggleClass('active')
    $('#overlay').toggleClass('active')
    $('body').addClass('popup-visible')
    }
    else if(flag == 'type3'){ // type3 - parts-consumed
    $(field).attr('disabled', 'disabled') // disable the field to prevent keyboard entry
    // Determine name and id for tse and insert into html
    var lookupValue = $(field).attr('value')
    $('#' + lookup + ' input').attr('value', lookupValue)

    //  Open Lookup (#lookup) and overlay
    var popup = $('#' + lookup)
    $(popup).toggleClass('active')
    $('#overlay').toggleClass('active')
    $('#pop-ups').addClass('active')
    }
    else { //type4 - email-csr, report, update-woli
    $(field).attr('disabled', 'disabled') // disable the field to prevent keyboard entry
    // Determine name and id for tse and insert into html
    var lookupValue = $(field).attr('value')
    $('#' + lookup + ' input').attr('value', lookupValue)

    //  Open Lookup (#lookup) and overlay
    var popup = $('#' + lookup)
    $(popup).toggleClass('active')
    $('#overlay').toggleClass('active')
    }
}

function openPicklist(field, picklist) {
    selectedLookUp = ""
    selectedPickUp = $(field)
    $(field).attr('disabled', 'disabled') // disable the field to prevent keyboard entry
    // Get correct pop up Overlay & display pop up
    var popup = $('#pop-ups #' + picklist)
    $(popup).toggleClass('active')
    $('#overlay').toggleClass('active')
}

function clearSelection() {  
    $(selectedLookUp).removeAttr('data-id')
    $(selectedLookUp).val('')
    $(selectedLookUp).removeAttr('data-description')
    closePopUps()
    enableDisableButtons()
}

function closePopUps() {
    $('.pop-up').removeClass('active')
    $('#overlay').removeClass('active')
    $('body').removeClass('popup-visible')
    if (inlineTsEntry) {
        tsElement = '.inline-timesheet-entry-table .trow:last'
    } else {
        tsElement = '.timesheet-entry.active'
    }
    if(!inlineTsEntry){
    $('input:disabled').removeAttr('disabled')
    } else {
        $(selectedTimePicker).removeAttr('disabled');
        $(selectedLookUp).removeAttr('disabled'); 
        $(selectedPickUp).removeAttr('disabled'); 
        if($('.inline-form-container').hasClass('clone')) {
            $('input', tsElement + ' .timesheet-entry-date').removeAttr('disabled')
} else if($('.global_inline .inline-form-container').hasClass('global_create')){
            if($('.global_inline.active .inline-timesheet-entry-table .trow.tbody').length === 1){
                $('.global_inline.active .inline-form-container').find(".inline-timesheet-entry-table .trow.tbody:last .timesheet-entry-date input").attr("disabled", false)

            }
        }
    }
}

// Show / hide the dropdown when tab is clicked on mobile devices
function dropdownControlOnClick() {
    $('#dropdown').toggleClass('active')
    $('#dropdown-control i').toggleClass('icon-down-arrow')
    $('#dropdown-control i').toggleClass('icon-up-arrow')
}

function onClickTimeSlot(ele) {
    // if ($('div.process-loader').hasClass('active')) {
    //     return
    // }
    // inlineTsEntry = false;
    // hideInlineTSE()
    // const slotStart = $('.time-slot-label', $(ele)).text()
    // addTimeSheetEntry('day', slotStart)
        var isDataSfId= $(".inline-form-container").attr("data-sfid")
        if(typeof isDataSfId !== 'undefined'){
            $(".inline-form-container").removeAttr("data-sfid")
        }
        if ($('div.process-loader').hasClass('active')) {
            return
        }
        if(dayInlineTSClick === true){
            showDiscardInlineTspopup('timeClick', ele);
        } else{
		inlineTsEntry = true;
		dayInlineTSClick=false;
    const slotStart = $('.time-slot-label', $(ele)).text()
		if ($('.inline-form-container:visible').length > 0 ) {
			dayInlineTSClick = true;
		}
		if(dayInlineTSClick === true){
			showDiscardInlineTspopup('timeClick', ele);
		}  
		if(dayInlineTSClick === false){
    		hideInlineTSE()
			var selectedDateContainer;
			var dayContainerToAppend;    
			inlineTsEntry = true;
			$('.inline-form-container').removeClass('view edit clone create global_create').addClass('create')
			$('.tcolumn.action-inline-btn').show()
			$('.tcolumn.tcolumn_new').show()
			$('.inline-form-container').removeClass('rejected approved submitted new').addClass('new')
			$('.inline-form-container button.inline-save-btn').attr('disabled', true)
			const selectedDate = $(ele).closest(".day").attr('data-date')
			//selectedDateContainer = $(ele).parents('.time-slot')
			dayContainerToAppend = $(ele)
			const parsedDate = moment.utc(selectedDate).format('DD/MM/YYYY')
			const parsedDateValue = moment.utc(selectedDate).format('YYYY-MM-DD')
			$(".inline-timesheet-entry-table").find("div.trow:last input[name='entry-date']").val(parsedDate);
			$(".inline-timesheet-entry-table").find("div.trow:last input[name='entry-date']").attr({ 'value': parsedDateValue, "disabled": true })
			/* if (selectedDateContainer.length >= 0) {
				$('.day').removeClass('active')
			} */
			$(ele).closest(".day").addClass('active')
			$( ".inline-form-container").insertAfter(dayContainerToAppend);  

			dayInlineTSClick = true;
			
			showInlineTSE()
		  //  $(ele).closest(".day").find('.inline-form-container').css({ display: 'block' });
			resetInlineFields()
			//enableDisableAddbutton();
			
			if(inlineTsEntry){
				tsElement = '.inline-timesheet-entry-table'
			} else {
				tsElement =  '.timesheet-entry.active'
			}                
			addTimeSheetLineEntry('day',slotStart, selectedDate)                
			//tsEntryRow = $(".inline-timesheet-entry-table").find("div.trow:last").clone(true,true);
			if($(".inline-timesheet-entry-table").find("div.tbody.trow").length == 1){
				$(".inline-timesheet-entry-table").find('div.tbody.trow:first .delete-ts-entry').hide()
			}
			enableAndDisableIcons()
		}  
    }
}

function addTimeSheeTotalStatus() {
     if ($('.inline-form-container:visible:not(.view)').length > 0 ) {    
        showDiscardInlineTspopup("addTimeSheeTotalStatus");
     }
     else{
    inlineTsEntry = false;
    dayInlineTSClick = false
    if(inlineTsEntry){
        tsElement = '.inline-timesheet-entry-table'
    } else {
        tsElement =  '.timesheet-entry.active'
    }
    if (totalSatusSelected == true) {
			//const parsedDate = moment().add(1, 'days').format("DD/MM/YYYY")
			//const parsedDate = moment().format("DD/MM/YYYY")
			//const parsedDateValue= moment().format('YYYY-MM-DD')
			if ($('div.day').hasClass('active')){
				$('div.day').removeClass('active')
			}
			$('body').removeClass('view-timesheet-entry-status filter-total')
			//addTimeSheetEntry('timesheet', parsedDate, parsedDateValue)
        hideInlineTSE()
			addTimeSheetEntry('timesheetGlobal')
        if(inlineTsEntry){
            tsElement = '.inline-timesheet-entry-table'
        } else {
            tsElement =  '.timesheet-entry.active'
        }
        
	}
}
}



async function addTimeSheetLineEntry(context, timeslot, selectedDate) {
    let newTSE = $('.inline-timesheet-entry-table', '.inline-form-container') 
    newTSE.addClass('active').addClass('create').addClass('new')
    // Add relevant class based on launch context
    if (objectType) {
        if (newTSE.hasClass('non-work-order-related')) {
            newTSE.removeClass('non-work-order-related')
            newTSE.addClass('work-order-related')
        } else {
            newTSE.addClass('work-order-related')
        }
    } else {
        if (newTSE.hasClass('work-order-related')) {
            newTSE.removeClass('work-order-related')
            newTSE.addClass('non-work-order-related')
        } else {
            newTSE.addClass('non-work-order-related')
        }
    }
    newTSE = '.inline-timesheet-entry-table .trow:last'
    if (rejectedToNew == true) {
        buildPicklistsLookups()
        buildWOLILookUpNew(newTSE)
    }
    buildWOLILookUpNew(newTSE)    
    if (context === 'day') { // Launch from + icon in view-day or view-day-list or from clicking on a time slot
        // Get the correct day - active day within active timesheet
        const correctDay = $('.timesheet.active .day.active')

        // Set the Launch View context as either view-day or view-day-list
        if ($('body').hasClass('view-day')) {
            launchViewContext = 'view-day'
            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
        } else if ($('body').hasClass('view-day-list')) {
            launchViewContext = 'view-day-list'
            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
        }

        // Set date
        const prettyDate = correctDay.attr('data-date')
        $('.timesheet-entry-date input', newTSE).attr('value', prettyDate)
        $('.timesheet-entry-date input', newTSE).val(setLocaleDateString(prettyDate))
        $('.timesheet-entry-date input', newTSE).attr('disabled', true)


        // Get time slots which are already blocked
        const blockedTimeSlots = getBlockedTimeSlots(prettyDate)
        // the selected target start time
        const targetStartTime = moment(`${prettyDate}T${timeslot ? timeslot : moment().local().format('HH:mm')}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
        // Start time should be greatest of now() rounded down to the nearest half hour, and the End Time of any TSE that covers now()
        // now we try to calculate a feasible start time based on that
        const safeStartTime = moment(targetStartTime)
        if (!timeslot) {
            if (safeStartTime.minute() < 29) {
                safeStartTime.minute(0)
            } else {
                safeStartTime.minute(30)
            }
        }

        // Adjust according to existing TSEs if necessary
        const blockingSlot = blockedTimeSlots.find(slot => safeStartTime >= slot.startTime && safeStartTime <= slot.endTime)
        if (blockingSlot) safeStartTime.set(blockingSlot.endTime.toObject())

        if (safeStartTime.isSame(targetStartTime, 'day') && !(safeStartTime.hour() === 23 && safeStartTime.minute() === 59)) { // If start time is on the same day and not at 23:59 then set the Start Time of the new TSE
            $('.timesheet-entry-start-time input', newTSE).val(safeStartTime.format('HH:mm'))
        }

        // End Time should be the lowest of Start Time + half hour, and the Start Time of the first TSE that starts after calculated Start Time
        // Start with the start time (calcStartTime) + 30 minutes
        const safeEndTime = moment(safeStartTime).add(30, 'minutes')

        // are there any blocked time slots in the next 30 minutes? if so adjust accordingly
        const nextBlockedSlot = blockedTimeSlots.find(slot => safeEndTime >= slot.startTime && safeEndTime <= slot.endTime)
        if (nextBlockedSlot) safeEndTime.set(nextBlockedSlot.startTime.toObject())

        if (safeEndTime.isSame(targetStartTime, 'day')) { // If end time is on the same day set it as the End Time
            $('.timesheet-entry-end-time input', newTSE).val(safeEndTime.format('HH:mm'))
        } else { // if end time is on the next day set the End Time as 24:00
            $('.timesheet-entry-end-time input', newTSE).val('24:00')
	}

        // Set default Allowance Currency to User currency
        $('.timesheet-entry-FSLABB_Allowance_Amount_Currency__c input', newTSE).val(userCurrency)
        $('.timesheet-entry-FSLABB_Allowance_Amount_Currency__c input', newTSE).attr('data-id', userCurrency)


        // Set default Country to User Country
        $('.timesheet-entry-FSLABB_Country__c input', newTSE).val(userCountry)
        $('.timesheet-entry-FSLABB_Country__c input', newTSE).attr('data-id', userCountryCode)


        // Set default WOLI if we have one
        if (workOrderLineItemId != undefined) {
            $('.timesheet-entry-WorkOrderLineItemId input', newTSE).val(workOrderLineItemName)
            $('.timesheet-entry-WorkOrderLineItemId input', newTSE).attr('data-id', workOrderLineItemId)
        }
        //always show value checked for allowence
        //  $('.timesheet-entry-FSLABB_Allowance__c input', newTSE).prop('checked', true)
        $("div[data-dependentKey='FSLABB_Allowance__c']").css("display", "")
        //  $("div[data-dependentKey='FSLABB_Allowance_Type']", newTSE).hide()
        // Append the TSE to the Correct Day
        //$('.day-timesheet-entry-container', correctDay).append(newTSE)
    } else if (context === 'dayGlobal') { // Launch from + icon in view-day or view-day-list or from clicking on a time slot
        // Get the correct day - active day within active timesheet
        const correctDay = $('.timesheet.active .day.active')

        // Set the Launch View context as either view-day or view-day-list
        if ($('body').hasClass('view-day')) {
            launchViewContext = 'view-day'
            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
        } else if ($('body').hasClass('view-day-list')) {
            launchViewContext = 'view-day-list'
            correctDay.attr('data-scroll', $('.day-calendar-content', correctDay).scrollTop())
        }

        // Set date
        const prettyDate = correctDay.attr('data-date')
        $('.timesheet-entry-date input', newTSE).attr('value', prettyDate)
        $('.timesheet-entry-date input', newTSE).val(setLocaleDateString(prettyDate))
        $('.timesheet-entry-date input', newTSE).attr("disabled", true)

        // Get time slots which are already blocked
        const blockedTimeSlots = getBlockedTimeSlots(prettyDate)
        // the selected target start time
        const targetStartTime = moment(`${prettyDate}T${timeslot ? timeslot : moment().local().format('HH:mm')}`, moment.HTML5_FMT.DATETIME_LOCAL, true)
        // Start time should be greatest of now() rounded down to the nearest half hour, and the End Time of any TSE that covers now()
        // now we try to calculate a feasible start time based on that
        const safeStartTime = moment(targetStartTime)
        if (!timeslot) {
            if (safeStartTime.minute() < 29) {
                safeStartTime.minute(0)
            } else {
                safeStartTime.minute(30)
            }
        }

        // Adjust according to existing TSEs if necessary
        const blockingSlot = blockedTimeSlots.find(slot => safeStartTime >= slot.startTime && safeStartTime <= slot.endTime)
        if (blockingSlot) safeStartTime.set(blockingSlot.endTime.toObject())

        if (safeStartTime.isSame(targetStartTime, 'day') && !(safeStartTime.hour() === 23 && safeStartTime.minute() === 59)) { // If start time is on the same day and not at 23:59 then set the Start Time of the new TSE
            $('.timesheet-entry-start-time input', newTSE).val(safeStartTime.format('HH:mm'))
        }

        // End Time should be the lowest of Start Time + half hour, and the Start Time of the first TSE that starts after calculated Start Time
        // Start with the start time (calcStartTime) + 30 minutes
        const safeEndTime = moment(safeStartTime).add(30, 'minutes')

        // are there any blocked time slots in the next 30 minutes? if so adjust accordingly
        const nextBlockedSlot = blockedTimeSlots.find(slot => safeEndTime >= slot.startTime && safeEndTime <= slot.endTime)
        if (nextBlockedSlot) safeEndTime.set(nextBlockedSlot.startTime.toObject())

        if (safeEndTime.isSame(targetStartTime, 'day')) { // If end time is on the same day set it as the End Time
            $('.timesheet-entry-end-time input', newTSE).val(safeEndTime.format('HH:mm'))
        } else { // if end time is on the next day set the End Time as 24:00
            $('.timesheet-entry-end-time input', newTSE).val('24:00')
        }

        // Set default Allowance Currency to User currency
        $('.timesheet-entry-FSLABB_Allowance_Amount_Currency__c input', newTSE).val(userCurrency)
        $('.timesheet-entry-FSLABB_Allowance_Amount_Currency__c input', newTSE).attr('data-id', userCurrency)


        // Set default Country to User Country
        $('.timesheet-entry-FSLABB_Country__c input', newTSE).val(userCountry)
        $('.timesheet-entry-FSLABB_Country__c input', newTSE).attr('data-id', userCountryCode)


        // Set default WOLI if we have one
        if (workOrderLineItemId != undefined) {
            $('.timesheet-entry-WorkOrderLineItemId input', newTSE).val(workOrderLineItemName)
            $('.timesheet-entry-WorkOrderLineItemId input', newTSE).attr('data-id', workOrderLineItemId)
        }
        //always show value checked for allowence
        //  $('.timesheet-entry-FSLABB_Allowance__c input', newTSE).prop('checked', true)
        $("div[data-dependentKey='FSLABB_Allowance__c']").css("display", "")
        //  $("div[data-dependentKey='FSLABB_Allowance_Type']", newTSE).hide()
        // Append the TSE to the Correct Day
        //$('.day-timesheet-entry-container', correctDay).append(newTSE)
    } else if (context === 'timesheetGlobal') {
        enableDisableButtons();
        launchViewContext = 'view-timesheets'
        const dummyDay = $('.day', '#domtemplates').clone(true, true) // create a dummy day holding container
        dummyDay.addClass('active') // Make the dummy day active so that we can see the TSE
        $('div.timesheet-entry-date div.value', newTSE).text('')
        $('div.timesheet-entry-date input', newTSE).attr('value', '')
        $('div.timesheet-entry-date input', newTSE).val('')
        $('div.timesheet-entry-date input', newTSE).change()
        // Delete id on JQueryUI Date picker otherwise datepicker uses wrong field
        $('div.timesheet-entry-date input', newTSE).removeAttr('id')
        $('div.timesheet-entry-date input', newTSE).removeClass('hasDatepicker')
    
        const currentTime = moment()
        const safeStartTime = moment()
        if (safeStartTime.minute() <= 29) {
            safeStartTime.minute(0)
        } else {
            safeStartTime.minute(30)
        }
    
        if (safeStartTime.isSame(currentTime, 'day') && !(safeStartTime.hour() === 23 && safeStartTime.minute() === 59)) { // If start time is on the same day and not at 23:59 then set the Start Time of the new TSE
            $('.timesheet-entry-start-time input', newTSE).val(safeStartTime.format('HH:mm'))
        }
    
        // End Time should be Start Time + half hour
        // Start with the start time (calcStartTime) + 30 minutes
        const safeEndTime = moment(safeStartTime).add(30, 'minutes')
    
        if (safeEndTime.isSame(safeStartTime, 'day')) { // If end time is on the same day set it as the End Time
            $('.timesheet-entry-end-time input', newTSE).val(safeEndTime.format('HH:mm'))
            $('.timesheet-entry-duration input', newTSE).val(0.5)
        } else { // if end time is on the next day set the End Time as 24:00
            $('.timesheet-entry-end-time input', newTSE).val('24:00')
            var durationInMinutes = moment.utc(moment('24:00', "HH:mm").diff(moment(safeStartTime, "HH:mm"))).format("HH:mm")
    
            var totalMinutes = getTimeMinutesfromPretty(durationInMinutes)
    
    
            const durationinHrs = round2Fixed(totalMinutes / 60)
    
            $('.timesheet-entry-duration input', newTSE).val(durationinHrs)
        }
        $(".timesheet-entry-date input",newTSE).attr("disabled",false);
        // Set default Allowance Currency to User currency
        $('.timesheet-entry-FSLABB_Allowance_Amount_Currency__c input', newTSE).val(userCurrency)
        $('.timesheet-entry-FSLABB_Allowance_Amount_Currency__c input', newTSE).attr('data-id', userCurrency)

        // Set default Allowance Currency to User currency
        $('.timesheet-entry-FSLABB_Country__c input', newTSE).val(userCountry)
        $('.timesheet-entry-FSLABB_Country__c input', newTSE).attr('data-id', userCountryCode)
       // $("div[data-dependentKey='FSLABB_Allowance__c']", newTSE).hide()
        // Set default WOLI if we have one
        if (launchContext.workOrderLineItemId != undefined && launchContext.workOrderLineItemId !="") {
            $('.timesheet-entry-WorkOrderLineItemId input', newTSE).val(workOrderLineItemName)
            $('.timesheet-entry-WorkOrderLineItemId input', newTSE).attr('data-id', launchContext.workOrderLineItemId)
        }

       // $('.day-timesheet-entry-container', dummyDay).append(newTSE) // append the TSE to the dummy day
       // $('.day-container', '.timesheet.active').append(dummyDay) // append the dummy day to the active timesheet

        if (totalSatusSelected == true) {
            $('.timesheet-entry-date input', newTSE).val(timeslot)
            $('.timesheet-entry-date input', newTSE).attr('value', selectedDate)
	}
	} else if (context === 'timesheet') {
    const correctDay = $('.timesheet.active .day.active')
        const globalInline = $(`[value='${selectedDate}']`).closest(".timesheet-entry-content");
        const prevDate = $(`[value='${selectedDate}']`).closest(".timesheet-entry");
        const prettyDate = correctDay.attr('data-date')
        if (globalInline.hasClass("global_create")) {
            var blockedTimeSlots = await getBlockedTimeSlots(selectedDate)
        } else {
            var blockedTimeSlots = await getBlockedTimeSlots(prettyDate)
        }
	        let endTimeEntry = ""
	            let startTimeEntry = ""
        let timeEntry = $('.inline-form-container').parents('.day-calendar-content').find('.day-timesheet-entry-container .timesheet-entry');
	        if (timeEntry.length > 0) {
	            endTimeEntry = timeEntry[timeEntry.length - 1].getAttribute('data-end-time')
            startTimeEntry = timeEntry[timeEntry.length - 1].getAttribute('data-start-time')
        }
	        if ($(newTSE).prev('.tbody').length > 0) {
	            endTimeEntry = $(newTSE).prev('.tbody').attr('data-end-time')
        startTimeEntry = $(newTSE).prev('.tbody').attr('data-start-time')
	        // endTimeEntry = moment.tz(`${selectedDate}T${endTimeEntry}`,userTimezone).format()
	        // endTimeEntry = moment(endTimeEntry, 'hh:mm')
        }
	        const startMoment = moment(startTimeEntry)
	        $(".global_create .timesheet-entry-date input").attr("disabled", true);
        const firstBlockAhead = blockedTimeSlots.filter(slot => slot.startTime <= startMoment)
        
        $('.timesheet-entry-start-time input', newTSE).val('00:00').change()
        if (firstBlockAhead.length > 0) {
            $('.timesheet-entry-start-time input', newTSE).val(firstBlockAhead[firstBlockAhead.length - 1].endTime.format('HH:mm')).change()
            if (firstBlockAhead[firstBlockAhead.length - 1].endTime.format('HH:mm') === "00:00") {
                $('.timesheet-entry-start-time input', newTSE).val('').change()
            $('.timesheet-entry-end-time input', newTSE).val('').change()
            }
	}
	}

    
    showHideFields()

    // trigger date change so populate SA or set popup
    $('.timesheet-entry-date input', newTSE).change()

    // Focus on subject field
    $('.timesheet-entry-subject input', newTSE).focus()
}
function addTSLineTotalStatus(ele){	
    if ($('div.process-loader').hasClass('active')) {
        return
    }
   if( $(ele).closest(".day").find('.inline-form-container:visible').length > 0 && $(ele).closest(".day").find('.inline-form-container:visible').hasClass('create')){
        return;
   }
	if(totalSatusSelected == true){
		if ($('.inline-form-container:visible').length > 0 && !$('.inline-form-container:visible').hasClass('view')) {
            dayInlineTSClick = true;
        }
        if(dayInlineTSClick === true){
            showDiscardInlineTspopup('dayClick', ele);
        }  
        if(dayInlineTSClick === false){
            hideInlineTSE()
            var selectedDateContainer;
            var dayContainerToAppend;    
            inlineTsEntry = true;
            $('.inline-form-container').removeClass('view edit clone create').addClass('create')                
            if($('.inline-form-container').hasClass('create')){
                $('.inline-form-container').attr('data-sfid', '')
                $('.inline-form-container').attr('data-date', '')
            }
            $('.tcolumn.action-inline-btn').show()
            $('.tcolumn.tcolumn_new').show()
            $('.inline-form-container').removeClass('rejected approved submitted new').addClass('new')
            $('.inline-form-container button.inline-save-btn').attr('disabled', true)
		const selectedDate = $(ele).closest(".day").attr('data-date')
            selectedDateContainer = $(ele).parents('div.day')
            dayContainerToAppend = $(selectedDateContainer).find('.day-timesheet-entry-container')
            const parsedDate = moment.utc(selectedDate).format('DD/MM/YYYY')
            const parsedDateValue = moment.utc(selectedDate).format('YYYY-MM-DD')
            $(".inline-timesheet-entry-table").find("div.trow:last input[name='entry-date']").val(parsedDate);
            $(".inline-timesheet-entry-table").find("div.trow:last input[name='entry-date']").attr({ 'value': parsedDateValue, "disabled": true })
            /* if (selectedDateContainer.length >= 0) {
			$('.day').removeClass('active')
            } */
            $(ele).closest(".day").addClass('active')
            $( ".inline-form-container").insertAfter(dayContainerToAppend);                         
            dayInlineTSClick = true;
            
            showInlineTSE()
        //  $(ele).closest(".day").find('.inline-form-container').css({ display: 'block' });
            //resetInlineFields()
            //enableDisableAddbutton();
            
            if(inlineTsEntry){
                tsElement = '.inline-timesheet-entry-table'
            } else {
                tsElement =  '.timesheet-entry.active'
            }                
            addTimeSheetLineEntry('timesheet','',selectedDate)                
            //tsEntryRow = $(".inline-timesheet-entry-table").find("div.trow:last").clone(true,true);
            if($(".inline-timesheet-entry-table").find("div.tbody.trow").length == 1){
                $(".inline-timesheet-entry-table").find('div.tbody.trow:first .delete-ts-entry').hide()
            }
            enableAndDisableIcons()
		}
	}
}
function createLookupWOLI(lookup) {
    // Get data for field & iterate through data
    var fieldLookupData = lookupData[lookup]
    if (fieldLookupData.length < 1) {
        // If there isn't any data returned
        $('#pop-ups #' + lookup + ' tbody').append('<tr><td colspan="2">No Data Found</td></tr>')
    } else {
        $('#pop-ups #' + lookup + ' tbody').html("")
        fieldLookupData.forEach((row) => {
            // Clone tr dom template
            var clone = $('#domtemplates #lookupRecordTemplate tr.lookup-record-WOLI').clone(true, true)

            // Populate clone with data from the selected field
            $(clone).attr('data-sfid', row.Id)
            $(clone).attr('data-search', createSearchable(row.LineItemNumber, row.Subject))
            $('td.record-name', clone).text(row.LineItemNumber)
            $('td.record-description', clone).text(row.Subject)

            // Append row to field
            $('#pop-ups #' + lookup + ' tbody').append(clone)
        })
    }
}
function createLookupSalesOrder(lookup) {
    // Get data for field & iterate through data
    var fieldLookupData = lookupData[lookup]
    if (fieldLookupData.length < 1) {
        // If there isn't any data returned
        $('#pop-ups #' + lookup + ' tbody').append('<tr><td>No Data Found</td></tr>')
    } else {
        $('#pop-ups #' + lookup + ' tbody').html("");
        fieldLookupData.forEach((row) => {
            // Clone tr dom template
            var clone = $('#domtemplates #lookupRecordTemplate tr.lookup-record-SD').clone(true, true)

            // Populate clone with data from the selected field
            //$(clone).attr('data-sfid', row.Id).attr('data-description', row.FSLABB_SAP_Description__c).attr('data-search', createSearchable(row.Name, row.FSLABB_SAP_Description__c))
            $(clone).attr('data-sfid', row.Id)
            $(clone).attr('data-search', createSearchable(row.LineItemNumber, row.FSLABB_SAP_Description__c))
            $('td.record-name', clone).text(row.Name)
            $('td.record-description', clone).text(row.FSLABB_SAP_Description__c)
            $('td.record-status', clone).text(row.FSLABB_Status__c)
            // Append row to field
            $('#pop-ups #' + lookup + ' tbody').append(clone)
        })
    }
}

function toggleAllowanceCurrency(field) {

    var isDataCurrency = $(field).attr('data-iscurrency')
    if(inlineTsEntry){
        tsElement = '.inline-timesheet-entry-table .timesheet-entry.active'
    } else {
        tsElement =  '.timesheet-entry.active'
    }
   // var activeTSE = $('div.timesheet.active div.day.active div.timesheet-entry.active')
    if (isDataCurrency == 'TRUE') {
        $("div[data-dependentKey='FSLABB_Allowance_Type']", tsElement).css("display", "")
        $(".theader div[data-dependentKey='FSLABB_Allowance_Type']").css("display", "")
    } else {
        $("div[data-dependentKey='FSLABB_Allowance_Type']", tsElement).hide()
        $(".theader div[data-dependentKey='FSLABB_Allowance_Type']").hide()
        
    }

    enableDisableButtons()
}

function populateLookupField(row) {
    // Get data-sfid attribute from the th that was clicked
    var rowSFID = $(row).attr('data-sfid')
    var rowSFAPI = $(row).closest('.lookup').attr('id')
    // Get .record-name of the th clicked
    var rowName = $('td.value', row).text()

    // Get original tse launching field
    var tseField = $('div.timesheet-entry.active div[data-sfapi="' + rowSFAPI + '"] input')

    // If Absence Type
    if (rowSFAPI = 'FSLABB_Absence_Type') {
        // Get description attribute value
        var rowDescription = $(row).attr('data-description')

        // Set data-description attribute of original tse launching field
        $(tseField).attr('data-description', rowDescription)
    }

    // If Allowance type
    if (rowSFAPI = 'FSLABB_Allowance_Type__c') {
        // Get description attribute value
        var rowCurrency = $(row).attr('data-iscurrency')

        // Set data-iscurrency attribute of original tse launching field
        $(tseField).attr('data-iscurrency', rowCurrency)
    }
    // Set data-id attribute of original tse launching field
    $(tseField).attr('data-id', rowSFID)

    // Set value of orginal tse launching field & Trigger change event
    $(tseField).val(rowName).change()

    // Close popup / overlay
    closePopUps()
}

// Looks at active TSE and hides/shows Other Order Type field
// Other Order Type is dependent upon Unproductive Code
function showHideOtherOrderType() {
    // Variable that determines wether we show or hide Other Order Type
    showOtherOrderType = false
    // Get active tse
    if(inlineTsEntry){
        tsElement = '.inline-timesheet-entry-table .timesheet-entry.active'
    } else {
        tsElement =  '.timesheet-entry.active'
    }

    // Determine if work order related or not
    if(inlineTsEntry){
        var woRelated = $(tsElement).parents('.inline-timesheet-entry-table').hasClass('work-order-related')
    } else {
        var woRelated = $(tsElement).hasClass('work-order-related')
    }

    // Determine if Other Order Type is hidden according to my-time-country-field rules
    var ootRules = country[userCountry].fields['FSLABB_OtherOrderType__c']
    if (ootRules['Work Order Related'] === 'FALSE' && woRelated || ootRules['Non-Work Order Related'] === 'FALSE' && !woRelated) {
        // If Other Order Type is not to be shown then end function
        return
    }
    // Determine the class used to hide fields
    var hideClass = 'not-on-work-order'
    if (!woRelated) {
        hideClass = 'not-on-non-work-order'
    }

    var activeTSE = $(tsElement)
    

    // Get Other Order Type code
    var otherOrderType = $('.timesheet-entry-FSLABB_OtherOrderType__c', activeTSE)

    // Get Unproductive Code field & if it's hidden according to wo/non-wo rules
    var unproductiveCode = $('.timesheet-entry-FSLABB_UnproductiveCode__c', activeTSE)
    var unproductiveCodeHidden = $(unproductiveCode).hasClass(hideClass)

    // Get Absence Type/Attendence Type & if it's hidden according to wo/non-wo rules
    var absenceType = $('.timesheet-entry-FSLABB_Absence_Type_ref__c', activeTSE)
    var absenceTypeHidden = $(absenceType).hasClass(hideClass)

    // Variable that determines wether we show or hide Other Order Type
    showOtherOrderType = false

    /* if(unProductiveShowByDefault.includes(userCountry)) {
          showOtherOrderType = true

     } else {*/
    // If neither Unproductive Code nor Absence Type are to be shown on form
    if (!unproductiveCodeHidden) { // Else if only Unproductive Code is visible
        // If Unproductive Code has NA selected
        if ($('input', unproductiveCode).attr('data-id') === "000000") {
            showOtherOrderType = true // Show other order type
        }
    } else if (unproductiveCodeHidden) { // Else if only Absense Type is visible
        // If Absence Type has NA selected
        //if ($('input', absenceType).attr('data-description') === "000000") {
        showOtherOrderType = true // Show other order type
        //}
    } else { // Else both Unproductive Code and Absence Type are visible
        // This is a data integrity issue. Log issue and do nothing else
        logToConsole('ERROR: Only Unproductive Code or Absence Type should be displayed. Not both.')
        return
    }
    //}

    // Actually show/hide now
    if (showOtherOrderType) {
        // Show Other Order Type
        $(otherOrderType).removeClass(hideClass)
    } else {
        // Hide Other Order Type and clear input
        $(otherOrderType).addClass(hideClass)
        $('input', otherOrderType).val('').attr('data-id', '')
    }
}

// Shows/Hides FSLABB_SAPId__c and FSLABB_SAPOperation__c
function showHideSAP() {
    // Determine if work order related or not
    if(inlineTsEntry){
        var woRelated = $(tsElement).parents('.inline-timesheet-entry-table').hasClass('work-order-related')
    } else {
        var woRelated = $(tsElement).hasClass('work-order-related')
    }


    // Determine the class used to hide fields
    var hideClass = 'not-on-work-order'
    if (!woRelated) {
        hideClass = 'not-on-non-work-order'
    }

    // Get active tse
    var activeTSE = $(tsElement)

    // Get Other Order Type, SAP Document Number, & SAP Operation Number
    var otherOrderType = $('.timesheet-entry-FSLABB_OtherOrderType__c', activeTSE)
    var sapDocNum = $('.timesheet-entry-FSLABB_SAPId__c', activeTSE)
    var sapOpNum = $('.timesheet-entry-FSLABB_SAPOperation__c', activeTSE)


    // Get Other Order Type value, and values for showing FSLABB_SAPId__c and FSLABB_SAPOperation__c
    var otherOrderTypeVal = $('input', otherOrderType).attr('data-id')
    var showSapDocNum = false
    var showSapOpNum = false

    // Show/Hide fields depending on this otherOrderTypeVal value
    switch (otherOrderTypeVal) {
        case 'NW':
            showSapDocNum = true
            showSapOpNum = true
            break

        case 'RCC':
            showSapDocNum = true
            showSapOpNum = false
            break

        case 'SD':
            showSapDocNum = true
            showSapOpNum = true
            break

        case 'ORD':
            showSapDocNum = true
            showSapOpNum = true
            break

        case 'WBS':
            showSapDocNum = true
            showSapOpNum = false
            break

        case 'INT_ORD':
            showSapDocNum = true
            showSapOpNum = false
            break
    }
    if (woRelated) {
        if (userCountryCode == 'CA') {

            if (sapSubProcessType == 'PS_Link_Project_NWA') {

                showSapOpNum = true
                if (activeTSE.hasClass('create')) {
                    $('input', sapOpNum).val(woProjectActivity).attr('data-id', woProjectActivity)
                }
            }
            else {
                showSapOpNum = false
            }
        }
    }
    // Show/Hide FSLABB_SAPId__c
    if (showSapDocNum) {
        // Show field
        $(sapDocNum).removeClass(hideClass)
    } else {
        // Hide and clear field
        $(sapDocNum).addClass(hideClass)
        $('input', sapDocNum).val('').attr('data-id', '')
    }

    // Show/Hide FSLABB_SAPOperation__c
    if (showSapOpNum) {
        // Show field and delete display css prop
        $(sapOpNum).removeClass(hideClass)
    } else {
        // Hide and clear field
        $(sapOpNum).addClass(hideClass)
        $('input', sapOpNum).val('').attr('data-id', '')
    }
    var ootRules = country[userCountry].fields['FSLABB_OtherOrderType__c']
        // Get Unproductive Code field & if it's hidden according to wo/non-wo rules
        var unproductiveCode = $('.timesheet-entry-FSLABB_UnproductiveCode__c', activeTSE)
        var unproductiveCodeHidden = $(unproductiveCode).hasClass(hideClass)

        // Get Absence Type/Attendence Type & if it's hidden according to wo/non-wo rules
        var absenceType = $('.timesheet-entry-FSLABB_Absence_Type_ref__c', activeTSE)
        var absenceTypeHidden = $(absenceType).hasClass(hideClass)
    if(inlineTsEntry && ((!woRelated && (ootRules['Non-Work Order Related'] !== 'FALSE' || ootRules['Work Order Related'] !== 'FALSE') && (showOtherOrderType || !unproductiveCodeHidden)) || 
        ((woRelated && ootRules['Work Order Related'] !== 'FALSE') && (showOtherOrderType || !unproductiveCodeHidden )))){
        $(sapDocNum).removeClass(hideClass)
        $(sapOpNum).removeClass(hideClass)
        $(otherOrderType).removeClass(hideClass)
        var tBody = $('.inline-timesheet-entry-table').find('.trow.tbody')            
        $('.trow.timesheet-entry.taddedrow').find('.timesheet-entry-FSLABB_OtherOrderType__c input').attr('disabled',true)
       // $('.trow.timesheet-entry.taddedrow').find('.timesheet-entry-FSLABB_OtherOrderType__c .delete-text').css({'pointer-events': 'none'})
       // $('.trow.timesheet-entry.taddedrow').find('.timesheet-entry-FSLABB_SAPId__c input').css({'pointer-events': 'none'})
        if(showOtherOrderType === false) { 
            $('.trow.timesheet-entry.active').find('.timesheet-entry-FSLABB_OtherOrderType__c input').attr('disabled',true)
        } else {
            $('.trow.timesheet-entry.active').find('.timesheet-entry-FSLABB_OtherOrderType__c input').attr('disabled',false)
        }
        $('.trow.timesheet-entry').find('.timesheet-entry-FSLABB_SAPId__c input').attr('disabled',true)
        $('.trow.timesheet-entry').find('.timesheet-entry-FSLABB_SAPOperation__c input').attr('disabled',true)
        if (showSapDocNum) {
            $('input', sapDocNum).attr('disabled',false)
        } else {
            // Hide and clear field
            $('input', sapDocNum).attr('disabled',true)
            $('input', sapDocNum).val('').attr('data-id', '')
        }
    
        // Show/Hide FSLABB_SAPOperation__c
        if (showSapOpNum) {
            // Show field and delete display css prop
            $('input', sapOpNum).attr('disabled',false)
        } else {
            // Hide and clear field
            $('input', sapOpNum).attr('disabled',true)
            $('input', sapOpNum).val('').attr('data-id', '')
        }
    }
    
    if(inlineTsEntry && !woRelated && ( showOtherOrderType || !unproductiveCodeHidden)){
        $('.trow.theader').find('.timesheet-entry-FSLABB_OtherOrderType__c').css('display',"")
        $('.trow.theader').find('.timesheet-entry-FSLABB_SAPId__c').css('display',"")
        $('.trow.theader').find('.timesheet-entry-FSLABB_SAPOperation__c').css('display',"")
    } 
    //|| (inlineTsEntry && !woRelated && showOtherOrderType === false) 
    if ((inlineTsEntry && woRelated && showOtherOrderType === false)) {
        $('.trow.theader').find('.timesheet-entry-FSLABB_OtherOrderType__c').hide()
        $('.trow.theader').find('.timesheet-entry-FSLABB_SAPId__c').hide()
        $('.trow.theader').find('.timesheet-entry-FSLABB_SAPOperation__c').hide()
    }
    if ((inlineTsEntry && !woRelated && showOtherOrderType === false)) {
        $('.trow.theader').find('.timesheet-entry-FSLABB_OtherOrderType__c').css('display', "")
        $('.trow.theader').find('.timesheet-entry-FSLABB_SAPId__c').css('display', "")
        $('.trow.theader').find('.timesheet-entry-FSLABB_SAPOperation__c').css('display', "")
        $(sapDocNum).removeClass(hideClass)
        $(sapOpNum).removeClass(hideClass)
        $(otherOrderType).removeClass(hideClass)
    }
}

// Shows/Hides lookup field FSLABB_SD_Sales_Order_Line_Item__c
function showHideSdSalesOrderLineItem() {
    if(inlineTsEntry){
        var woRelated = $(tsElement).parents('.inline-timesheet-entry-table').hasClass('work-order-related')
    } else {
        var woRelated = $(tsElement).hasClass('work-order-related')
    }
    var sdField = $('.timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c', tsElement)
    // If WO does not have field SAP Order Type (FSLABB_SAP_Document_Type__c)
    if (!hasSdOrder) {
        // a
        // Determine if work order related or not
        // Determine the class used to hide fields
        var hideClass = 'not-on-work-order'
        if (!woRelated) {
            hideClass = 'not-on-non-work-order'
        }

        // Get FSLABB_SD_Sales_Order_Line_Item__c field
        // hide FSLABB_SD_Sales_Order_Line_Item__c
        $(sdField).addClass(hideClass)
            if(inlineTsEntry){
                $('.timesheet-entry-FSLABB_SD_Sales_Order_Line_Item__c').hide()
            }
    }
}
function showHideAllowanceCurrency() {
    if(inlineTsEntry){
        tsElement = '.inline-timesheet-entry-table .timesheet-entry.active'
    } else {
        tsElement =  '.timesheet-entry.active'
    }
   // var activeTSE = $('div.timesheet.active div.day.active div.timesheet-entry.active')
    var dataValue = $('div.timesheet-entry-FSLABB_Allowance_Type_ref__c input', tsElement).attr('data-id')

    var isDataCurrency = $("div#FSLABB_Allowance_Type table tr[data-sfid='" + dataValue + "']").attr("data-iscurrency")

    if (isDataCurrency && isDataCurrency == 'TRUE') {
        $("div[data-dependentKey='FSLABB_Allowance_Type']", tsElement).css("display", "")
        $(".theader div[data-dependentKey='FSLABB_Allowance_Type']").css("display", "")
    } else {
        $("div[data-dependentKey='FSLABB_Allowance_Type']", tsElement).hide()
        $(".theader div[data-dependentKey='FSLABB_Allowance_Type']").hide()
    }
    enableDisableButtons()
}
function updateTimesheetEntryData() {
    var data = {
        'query': `SELECT TSE.Id AS Id,
                    TSE.FSLABB_ABBOvertimeCategory__c AS FSLABB_ABBOvertimeCategory__c,
                    TSE.Description AS Description,
                    TSE.DurationInMinutes AS DurationInMinutes,
                    TSE.EndTime AS EndTime,
                    TSE.TimeSheetEntryNumber AS TimeSheetEntryNumber,
                    TSE.FSLABB_ServiceAppointment_ref__c AS FSLABB_ServiceAppointment_ref__c,
                    TSE.FSLABB_ServiceAppointment_Name__c AS FSLABB_ServiceAppointment_Name__c,
                    TSE.FSLABB_Absence_Type_ref__c AS FSLABB_Absence_Type_ref__c ,
                    TSE.FSLABB_Absence_Type_Name__c AS FSLABB_Absence_Type_Name__c ,
                    TSE.FSLABB_ActivityType__c AS FSLABB_ActivityType_ref__c,
                    TSE.FSLABB_ActivityType_Name__c AS FSLABB_ActivityType_Name__c,
                    TSE.FSLABB_Allowance_Amount__c AS FSLABB_Allowance_Amount__c,
                    TSE.FSLABB_TK_Actuals_KMS__c AS FSLABB_TK_Actuals_KMS__c,
                    TSE.FSLABB_Allowance_Amount_Currency__c AS FSLABB_Allowance_Amount_Currency__c,
                    TSE.FSLABB_Allowance_Amount_Currency_Name__c AS FSLABB_Allowance_Amount_Currency_Name__c,
                    TSE.FSLABB_Allowance_Type_ref__c AS FSLABB_Allowance_Type_ref__c,
                    TSE.FSLABB_Allowance_Type_Name__c AS FSLABB_Allowance_Type_Name__c,
                    TSE.FSLABB_Bank_Time__c AS FSLABB_Bank_Time__c,
                    TSE.FSLABB_Category_ref__c AS FSLABB_Category_ref__c,
                    TSE.FSLABB_Price__c AS FSLABB_Price__c,
                    TSE.FSLABB_Currency__c AS FSLABB_Currency__c,
                    TSE.FSLABB_Category_Name__c AS FSLABB_Category_Name__c,
                    TSE.FSLABB_CostCenter__c AS FSLABB_CostCenter__c,
                    TSE.FSLABB_IsNonWorkRelated__c AS FSLABB_IsNonWorkRelated__c,
                    TSE.FSLABB_OtherOrderType__c AS FSLABB_OtherOrderType__c,
                    TSE.FSLABB_OtherOrderType_Name__c AS FSLABB_OtherOrderType_Name__c,
                    TSE.FSLABB_OvertimeCompensationAllowance__c AS FSLABB_OvertimeCompensationAllowance__c,
                    TSE.FSLABB_OvertimeCompensationAllowance_Nam__c AS FSLABB_OvertimeCompensationAllowance_Name__c,
                    TSE.FSLABB_Reject_Reason__c AS FSLABB_Reject_Reason__c,
                    TSE.FSLABB_TimeEntryType__c AS FSLABB_TimeEntryType__c,
                    TSE.HR_Up__c AS HR_Up__c,
                    TSE.HR_Down__c AS HR_Down__c,
                    TSE.FSLABB_Country__c AS FSLABB_Country__c,
                    TSE.FSLABB_TimeEntryType_Name__c AS FSLABB_TimeEntryType_Name__c,
                    TSE.FSLABB_UnproductiveCode__c AS FSLABB_UnproductiveCode__c,
                    TSE.FSLABB_UnproductiveCode_Name__c AS FSLABB_UnproductiveCode_Name__c,
                    TSE.FSLABB_Wage_Type_ref__c AS FSLABB_Wage_Type_ref__c,
                    TSE.FSLABB_Wage_Type_Name__c AS FSLABB_Wage_Type_Name__c,
                    TSE.FSLABB_SD_Sales_Order_Line_Item__c AS FSLABB_SD_Sales_Order_Line_Item__c,
                    TSE.FSLABB_SAPId__c AS FSLABB_SAPId__c,
                    TSE.FSLABB_SAPOperation__c AS FSLABB_SAPOperation__c,
					TSE.FSLABB_SAP_Element__c AS FSLABB_SAP_Element__c,
                    TSE.StartTime AS StartTime,
                    TSE.Status AS Status,
                    TSE.Subject AS Subject,
                    TSE.TimeSheetId AS TimeSheetId,
                    TSE.WorkOrderId AS WorkOrderId,
                    TSE.WorkOrderLineItemId AS WorkOrderLineItemId,
                    TSE.FSLABB_Overtime_Success__c,
                    TSE.LastModifiedDate AS LastModifiedDate,
                    TSE.RecordTypeId,
                    TSE.FSLABB_Allowance_Type_ref__c,
                    TSE.FSLABB_Allowance_Amount__c,
                    TSE.FSLABB_TK_Actuals_KMS__c,
                    TSE.FSLABB_TTTKUP__c,
                    TSE.FSLABB_TTTKDOWN__c,
                    TSE.FSLABB_TK_Master_KMS__c,
                    TSE.FSLABB_TT_Master_Mins__c,
                    TSE.FSLABB_CalculatedTSE__c,
                    TSE.FSLABB_OVT_HR_TSE__c,
                    TSE.FSLABB_Emergency_WO_TSE__c,                          
                    WOLI.Subject AS WorkOrderLineItem_Name__c,
                    WO.WorkOrderNumber AS WorkOrderNumber,
		    WO.FSLABB_SAP_Document_Type__c AS FSLABB_SAP_Document_Type__c,
                    AC.Name AS AccountName,
                    LO.Name AS SiteName
                FROM TimeSheetEntry TSE
                    Left Join WorkOrderLineItem WOLI ON WOLI.Id=TSE.WorkOrderLineItemId
                    Left Join WorkOrder WO on WO.Id=TSE.WorkOrderId
                    Left Join Account AC on AC.Id=WO.AccountId
                    Left Join Location LO on LO.Id=WO.FSLABB_Site__c
                WHERE TSE.FSLABB_ServiceResourceUser_ref__c = "${userId}" AND FSLABB_CalculatedTSE__c = 'FALSE' AND TSE.IsDeleted != 'Deleted'
                ORDER BY StartTime ASC`
    }

    var timesheetEntriesData = callJSAPI('select', data, 'TimeSheetEntry').then(
        function(result) {
            activityTypeVar = result;
        }
    ).catch(
        function(error) {
            logToScreen(error)
            logToConsole(error)
        }
    )
}
//start of code 75167
function backToLaunchPage(){
    if ($('.inline-form-container:visible:not(.view)').length > 0 ) {    
        showDiscardInlineTspopup("backToLaunchPage");
     }
     else{
        logToConsole('**objectId allowances: ' + objectId);
            returnToHomePage();
    }
}


async function getTimeSlots(date) { 
    let allTSEs = $('.timesheet-entry:not(.active)', `.day[data-date='${date}']`)
    let allTSEsforWeekly = $(`.day[data-date='${date}']`).parents('.timesheet').find('.timesheet-entry')
    let TSTId =  $(`.day[data-date='${date}']`).parents('.timesheet').attr('data-sfid')
    // Get all TSEs on the correct day apart from the current (active) one
    /* if(allTSEsforWeekly.length === 0) {
        await getTSEbyTimeSheetId(TSTId).then(async (result) => {
            await buildTimesheetEntries(result)
        })
    } */
    if(allTSEsforWeekly.length === 0 && TSTId) {
        const tsesByTid =  await getTSEbyTimeSheetId(TSTId)
        if(tsesByTid.length > 0) {
            buildTimesheetEntries(tsesByTid)
        }
    }
    allTSEs = $('.timesheet-entry:not(.active)', `.day[data-date='${date}']`)
    
    // Get valid TSE keys and return a simpler object list
    const availableSlotsInSheet = Object.keys(allTSEs)
        .filter(value => Number.isInteger(parseInt(value)))
        .map(key => {
            return {
                'startTime': moment($(allTSEs[key]).attr('data-start-time')).format("HH:mm:ss"),
                'endTime': moment($(allTSEs[key]).attr('data-end-time')).format("HH:mm:ss")
            }
        })
    return availableSlotsInSheet

}

function checkbetweenTimeSlots(time1, time2, time3) {
    var checkTime = moment(time1, 'hh:mm:ss')
    var beginningTime = moment(time2, 'hh:mm:ss')
    var endTime = moment(time3, 'hh:mm:ss')

    if (checkTime.isBetween(beginningTime, endTime) || checkTime.isSame(beginningTime) || checkTime.isSame(endTime)) {
        return true;
    } else {
        return false;
    }

}


/*** Check available TSEs **/
async function checkTSEs(date) {
    // Get all TSEs on the correct day apart from the current (active) one
    let allTSEs = $('.timesheet-entry:not(.active)', `.day[data-date='${date}']`)
    let allTSEsforWeekly = $(`.day[data-date='${date}']`).parents('.timesheet').find('.timesheet-entry')
    let TSTId =  $(`.day[data-date='${date}']`).parents('.timesheet').attr('data-sfid')
    // Get all TSEs on the correct day apart from the current (active) one
    if(allTSEsforWeekly.length === 0 && TSTId) {
        const tsesByTid =  await getTSEbyTimeSheetId(TSTId)
        if(tsesByTid.length > 0) {
            buildTimesheetEntries(tsesByTid)
        }
    }
    allTSEs = $('.timesheet-entry:not(.active)', `.day[data-date='${date}']`)
	if(allTSEs && allTSEs.length>0){
		return true
	} else {
		return false
	}
}

async function makecloneTimesheet() {
    isCloneConflict = false
    closePopUps();
    const timesheetEntry = $('.timesheet-entry.active')
    let cloneTimeSheetId = null
    let activeTsheetObj
    let curr = new Date($('#clone-data-date').attr('value'));
    var selectedCloneDate, availableDaysToClone = []
    var conflictTImeDate = []
    var conflictDate = []
    let numberofDays = $('#clone-days').val();
    let startDay = 0
    let activeDate = $('#timepicker-ok-clone').attr("data-date")
    for (let i = 0; i < numberofDays; i++) {
        let first = curr.getDate() + startDay
        selectedCloneDate = (new Date(curr.setDate(first)).toISOString().slice(0, 10))
        startDay = 1
        let allTImeSheets = document.getElementById('timesheets-container').getElementsByClassName("timesheet");
        activeTsheetObj = _.find(allTImeSheets, function (item) {
            let startDate = new Date(item.dataset.startdate);
            let endDate = new Date(item.dataset.enddate);
            if (Date.parse(startDate) <= Date.parse(selectedCloneDate) && Date.parse(endDate) >= Date.parse(selectedCloneDate)) {
                return true
            }
        })
        if (!activeTsheetObj) {
            conflictDate.push(selectedCloneDate)
            isCloneConflict = true
        }
        const isTSEsAvaiable = await checkTSEs(selectedCloneDate)
        
        if (isTSEsAvaiable) {
            conflictTImeDate.push(selectedCloneDate)
            isCloneConflict = true
        } else {
            availableDaysToClone.push(selectedCloneDate)
        }
    }

    if (isCloneConflict) {
        let errMsg1 = ''
        let errMsg2 = ''
        if (conflictTImeDate.length > 0) {
            let conflictTImeDates = conflictTImeDate.join(", ")
            errMsg1 = `The cloning cannot be completed since there are existing entries on the following dates: ${conflictTImeDates}. Please remove any entries from these dates and proceed with the cloning.`
        }
        if (conflictDate.length > 0) {
            let conflictDates = conflictDate.join(", ")
            errMsg2 = `The Timesheet cannot be cloned because the week you have selected is not available.<br>${conflictDates}`
        }
       
        $("#clone-warning div").html(`<p>${errMsg1}</p><p>${errMsg2}<p>`)
        $("#clone-warning").addClass("active");
        $('#overlay').addClass('active')
    } 
    if (!isCloneConflict && availableDaysToClone.length > 0) {  
        for (let i = 0; i < availableDaysToClone.length; i++) {
            selectedCloneDate = ''
            selectedCloneDate = availableDaysToClone[i]
            let allTImeSheets = document.getElementById('timesheets-container').getElementsByClassName("timesheet");
            let activeTsheetObj = _.find(allTImeSheets, function (item) {
                let startDate = new Date(item.dataset.startdate);
                let endDate = new Date(item.dataset.enddate);
                if (Date.parse(startDate) <= Date.parse(selectedCloneDate) && Date.parse(endDate) >= Date.parse(selectedCloneDate)) {
                    return true
                }
            })
            if (activeTsheetObj && activeTsheetObj.dataset.sfid) {
                showProcessLoader()
                cloneTimeSheetId = activeTsheetObj.dataset.sfid;
                if (!isCloneConflict || unblockedTSECountries.includes(userCountry)) {
                    const currentDayTSEs = $('.timesheet-entry:not(.active)', `.day[data-date='${activeDate}']`)
                    var curenntDateTSEIds = $(`.day[data-date='${activeDate}'] .timesheet-entry`).map(function () {
                        return "'" + $(this).attr('data-sfid') + "'"
                    }).get()
                    var tseIDString = ''
                    await callJSAPI('select', {
                        'query': `Select TimeSheetEntryNumber,StartTime,EndTime,CurrencyIsoCode,RecordTypeId,Type,WorkOrderId,WorkOrderLineItemId,Description,Subject,
DurationInMinutes,FSLABB_ActivityType__c,FSLABB_ServiceAppointment_ref__c, FSLABB_OvertimeCompensationAllowance__c,HR_Up__c,HR_Down__c,
 FSLABB_CostCenter__c,FSLABB_Country__c,FSLABB_OtherOrderType__c,FSLABB_SAPId__c,FSLABB_SAPOperation__c,FSLABB_SAP_Element__c,
 FSLABB_SAPSystem__c,FSLABB_TimeEntryType__c,FSLABB_UnproductiveCode__c,Category__c,
 FSLABB_Absence_Type_ref__c,FSLABB_Bank_Time__c,FSLABB_Category_ref__c,FSLABB_IsNonWorkRelated__c,FSLABB_Reject_Reason__c,FSLABB_SD_Sales_Order_Line_Item__c,
FSLABB_Wage_Type_ref__c,SAP_Order_Type__c,FSLABB_ProjectElement__c,FSLABB_ABBOvertimeCategory__c,FSLABB_CustomerFactor__c,FSLABB_AdjustedTime__c,FSLABB_Allowance__c,
FSLABB_Allowance_Type_ref__c,FSLABB_Allowance_Amount__c,FSLABB_TK_Actuals_KMS__c,FSLABB_TTTKUP__c,FSLABB_TTTKDOWN__c,FSLABB_TK_Master_KMS__c,
FSLABB_TT_Master_Mins__c,FSLABB_TTTKEnabledForCountry__c,FSLABB_CalculatedTSE__c,FSLABB_OVT_HR_TSE__c,FSLABB_Emergency_WO_TSE__c 
from TimeSheetEntry WHERE Id IN (${curenntDateTSEIds})`
                    }).then(async (oTimesheets) => {
                        if (oTimesheets.length > 0) {
                            for (let i = 0; i < oTimesheets.length; i++) {
                                let sitem = oTimesheets[i]
                                    let sTime = moment(sitem.StartTime).format("HH:mm:ss")
                                    let eTime = moment(sitem.EndTime).format("HH:mm:ss")

                                    var activeADate = moment(selectedCloneDate).format("Y-M-D")
                                    let startMoment = moment(activeADate + ' ' + sTime, 'Y-M-D HH:mm:ss');
                                    let endMoment = moment(activeADate + ' ' + eTime, 'Y-M-D HH:mm:ss');
                                    startMoment = moment(startMoment, moment.HTML5_FMT.DATETIME_LOCAL, true)
                                    endMoment = moment(endMoment, moment.HTML5_FMT.DATETIME_LOCAL, true)
                                    if (endMoment.isBefore(startMoment)) {
                                        endMoment = endMoment.add(1, 'd');
                                    }
                                    sitem.TimeSheetId = cloneTimeSheetId
                                    sitem.StartTime = startMoment.utc().format()
                                    sitem.EndTime = endMoment.utc().format()

                                    sitem.FSLABB_ServiceResourceUser_ref__c = userId

                                    sitem.IsDeleted = 'FALSE'
                                    sitem.Status = 'New'
                                    var reqData = {
                                        type: "create",
                                        object: "TimeSheetEntry",
                                        data: sitem
                                    }
                                    await callJSAPI(reqData.type, reqData.data, reqData.object)
                                        .then(async (result) => {
                                            tseIDString += "'" + result + "',"
                                            if (i === (oTimesheets.length - 1)) {
                                                if (tseIDString) {
                                                    tseIDString = tseIDString.replace(/,\s*$/, "")
                                                    const newRequest = {
                                                        type: "select",
                                                        object: "TimeSheetEntry",
                                                        data: {
                                                            query: `SELECT TSE.Id AS Id,
                                                TSE.Description AS Description,
                                                TSE.DurationInMinutes AS DurationInMinutes,
                                                TSE.EndTime AS EndTime,
                                                TSE.TimeSheetEntryNumber AS TimeSheetEntryNumber,
                                                TSE.FSLABB_ServiceAppointment_ref__c AS FSLABB_ServiceAppointment_ref__c,
                                                TSE.FSLABB_ServiceAppointment_Name__c AS FSLABB_ServiceAppointment_Name__c,
                                                TSE.FSLABB_Absence_Type_ref__c AS FSLABB_Absence_Type_ref__c,
                                                TSE.FSLABB_Absence_Type_Name__c AS FSLABB_Absence_Type_Name__c,
                                                TSE.FSLABB_ActivityType__c AS FSLABB_ActivityType_ref__c,
                                                TSE.FSLABB_ActivityType_Name__c AS FSLABB_ActivityType_Name__c,
                                                TSE.FSLABB_Allowance_Amount__c AS FSLABB_Allowance_Amount__c,
                                                TSE.FSLABB_TK_Actuals_KMS__c AS FSLABB_TK_Actuals_KMS__c,
                                                TSE.FSLABB_Allowance_Amount_Currency__c AS FSLABB_Allowance_Amount_Currency__c,
                                                TSE.FSLABB_Allowance_Amount_Currency_Name__c AS FSLABB_Allowance_Amount_Currency_Name__c,
                                                TSE.FSLABB_Allowance_Type_ref__c AS FSLABB_Allowance_Type_ref__c,
                                                TSE.FSLABB_Allowance_Type_Name__c AS FSLABB_Allowance_Type_Name__c,
                                                TSE.FSLABB_Bank_Time__c AS FSLABB_Bank_Time__c,
                                                TSE.FSLABB_Category_ref__c AS FSLABB_Category_ref__c,
                                                TSE.FSLABB_Category_Name__c AS FSLABB_Category_Name__c,
                                                TSE.FSLABB_CostCenter__c AS FSLABB_CostCenter__c,
                                                TSE.FSLABB_IsNonWorkRelated__c AS FSLABB_IsNonWorkRelated__c,
                                                TSE.FSLABB_OtherOrderType__c AS FSLABB_OtherOrderType__c,
                                                TSE.FSLABB_OtherOrderType_Name__c AS FSLABB_OtherOrderType_Name__c,
                                                TSE.FSLABB_OvertimeCompensationAllowance__c AS FSLABB_OvertimeCompensationAllowance__c,
                                                TSE.FSLABB_OvertimeCompensationAllowance_Nam__c AS FSLABB_OvertimeCompensationAllowance_Name__c,
                                                TSE.FSLABB_Reject_Reason__c AS FSLABB_Reject_Reason__c,
                                                TSE.FSLABB_TimeEntryType__c AS FSLABB_TimeEntryType__c,
                                                TSE.HR_Up__c AS HR_Up__c,
                                                TSE.HR_Down__c AS HR_Down__c,
                                                TSE.FSLABB_Country__c AS FSLABB_Country__c,
                                                TSE.FSLABB_TimeEntryType_Name__c AS FSLABB_TimeEntryType_Name__c,
                                                TSE.FSLABB_UnproductiveCode__c AS FSLABB_UnproductiveCode__c,
                                                TSE.FSLABB_UnproductiveCode_Name__c AS FSLABB_UnproductiveCode_Name__c,
                                            TSE.FSLABB_ABBOvertimeCategory__c AS FSLABB_ABBOvertimeCategory__c,
                                                TSE.FSLABB_Wage_Type_ref__c AS FSLABB_Wage_Type_ref__c,
                                                TSE.FSLABB_Wage_Type_Name__c AS FSLABB_Wage_Type_Name__c,
                                                TSE.FSLABB_SD_Sales_Order_Line_Item__c AS FSLABB_SD_Sales_Order_Line_Item__c,
                                                TSE.FSLABB_SAPId__c AS FSLABB_SAPId__c,
                                                TSE.FSLABB_SAPOperation__c AS FSLABB_SAPOperation__c,
                                                TSE.FSLABB_SAP_Element__c AS FSLABB_SAP_Element__c,
                                                TSE.StartTime AS StartTime,
                                                TSE.Status AS Status,
                                                TSE.Subject AS Subject,
                                                TSE.TimeSheetId AS TimeSheetId,
                                                TSE.WorkOrderId AS WorkOrderId,
                                                TSE.WorkOrderLineItemId AS WorkOrderLineItemId,
                                                TSE.LastModifiedDate AS LastModifiedDate,
                                                TSE.FSLABB_Allowance__c,
                                                TSE.FSLABB_Allowance_Type_ref__c,
                                                TSE.FSLABB_Allowance_Amount__c,
                                                TSE.FSLABB_TK_Actuals_KMS__c,
                                                TSE.FSLABB_TTTKUP__c,
                                                TSE.FSLABB_TTTKDOWN__c,
                                                TSE.FSLABB_TK_Master_KMS__c,
                                                TSE.FSLABB_TT_Master_Mins__c,
                                                TSE.FSLABB_CalculatedTSE__c,
                                                TSE.FSLABB_OVT_HR_TSE__c,
                                                TSE.FSLABB_Emergency_WO_TSE__c,
												TSE.RecordTypeId,
                                                WOLI.Subject AS WorkOrderLineItem_Name__c,
                                                WO.WorkOrderNumber AS WorkOrderNumber,
                                    WO.FSLABB_SAP_Document_Type__c AS FSLABB_SAP_Document_Type__c,
                                                AC.Name AS AccountName,
                                                LO.Name AS SiteName
                                            FROM TimeSheetEntry TSE
                                                Left Join WorkOrderLineItem WOLI ON WOLI.Id=TSE.WorkOrderLineItemId
                                                Left Join WorkOrder WO on WO.Id=TSE.WorkOrderId
                                                Left Join Account AC on AC.Id=WO.AccountId
                                                Left Join Location LO on LO.Id=WO.FSLABB_Site__c
                                                WHERE TSE.Id IN (${tseIDString})
                                                `,
                                                        },
                                                    }                                               
                                                    await callJSAPI(newRequest.type, newRequest.data, newRequest.object).then(async (readResult) => {
                                                        activityTypeVar = readResult
                                                        buildTimesheetEntries(readResult)
                                                        // Update the Days Totals
                                                        updateTimesheetTotals(true)
                                                        // Sort the timesheets properly
                                                        sortTimesheetEntries(true)
                                                        // Update the heights of bar charts, etc
                                                        chartHeightsAndInitialize(true)
                                                        updateTimesheetEntryData();
                                                        $("div.timesheet").removeClass('active');
                                                        $(`.timesheet[data-sfid='${cloneTimeSheetId}']`).addClass('active')
                                                        $(`div.day`).removeClass("active");
                                                        $(`.day[data-date='${selectedCloneDate}']`).addClass('active')
                                                      
                                                        //hideProcessLoader();
                                                    })
                                                    // if offline we simulate this by passing the whole result in the data which then gets sent straight back //REMOVE ON PRODUCTION
                                                    if (inPulsar) {
                                                        logToConsole("not in pulsar");
                                                        newRequest.data[0] = result;
                                                    }
                                                }
                                            }
                                        })

                            }
                        } else {                            
                            hideProcessLoader()
                        }
                    })
                }

            }
        }
        changeActionIcons()
        hideProcessLoader()
    }
}

function setOnlineStatus(status) {
    logToConsole('**setOnlineStatus:' + JSON.stringify(status))
    return callJSAPI('setOnlineStatus', status)
        .then((results) => {
            logToConsole('**setOnlineStatus success : ' + JSON.stringify(results))
        }).catch((error) => {
            logToConsole('**setOnlineStatus error: ' + JSON.stringify(error))
        })
}
function exitPageSyncForOVT() {
    onlineStatus = 'TRUE'
    logToConsole('**in IF : ' + onlineStatus)
    setOnlineStatus(onlineStatus).then(() => {
        logToConsole('in IF setOnlineStatus')
        return new Promise(function (resolve, reject) {
            var request = {
                "type": "syncdata",
                "data": {
                    "pushChangesSyncEnabled" : true, 
		            "useCompositeGraph" : true
                } 
            }
            pulsar.bridge.send(request, function (results) {
                pulsar.goBackToTab()
                pulsar.showNavBar()
            });
        }).catch(function (error) {
            logToScreen(error)
            logToConsole(error)
            reject(error)
        })
    });
}
//end of code 75167

// new inline tse
function resetInlineFields(){
    var OCFSLABB_ActivityType__c_field = $(".inline-timesheet-entry-table").find("div.trow:last div[data-sfapi='FSLABB_ActivityType'] input")
        var OCFSLABB_WageType__c_field = $(".inline-timesheet-entry-table").find("div.trow:last div[data-sfapi='FSLABB_Wage_Type'] input")
        var OCFSLABB_AbsenceType__c_field = $(".inline-timesheet-entry-table").find("div.trow:last div[data-sfapi='FSLABB_Absence_Type'] input")
        
        $(OCFSLABB_ActivityType__c_field).removeClass('input-disabled');
        $(OCFSLABB_ActivityType__c_field).attr('data-id', '');
        $(OCFSLABB_ActivityType__c_field).prop('disabled', false);
        $(OCFSLABB_ActivityType__c_field).val('').change();

        $(OCFSLABB_WageType__c_field).removeClass('input-disabled');
        $(OCFSLABB_WageType__c_field).attr('data-id', '');
        $(OCFSLABB_WageType__c_field).prop('disabled', false);
        $(OCFSLABB_WageType__c_field).val('').change();

        $(OCFSLABB_AbsenceType__c_field).removeClass('input-disabled');
        $(OCFSLABB_AbsenceType__c_field).attr('data-id', '');
        $(OCFSLABB_AbsenceType__c_field).prop('disabled', false);
        $(OCFSLABB_AbsenceType__c_field).val('').change();
}
function switchMyTime() {
    //pulsar.goBack()
    if (objectId) {
        pulsar.displayContentDocument(null, "My Time", { "objectId": objectId, "objectType": objectType, "serviceAppointmentId": saId, "sa_id": saId, "userId": userId, "userLocale": userLocale }, null);
    } else {
        pulsar.displayContentDocument(null, "My Time", { "userId": userId, "userLocale": userLocale }, null)
    }
}

function closeInlineTsEntry() {
    dayInlineTSClick = false
    $('#unsaved-inline-ts').removeClass('active')
    $('#overlay').removeClass('active')
if($(".time-slot .global_create").length>0){
        if($(".time-slot .global_create").attr("style").length>0){
           $(".timesheet.active .day.active .day-calendar-background .time-slot:first").removeAttr("style")
        }
    }
    hideInlineTSE()
}
function showDiscardInlineTspopup(action, ele) {
    selectedDayTs = $(ele)
    $('#unsaved-inline-ts').addClass('active')
    $('#overlay').addClass('active')
    if(action === 'dayClick') {
        dayInlineTSClick = true
        $('#unsaved-inline-ts-continue').removeAttr('onclick').attr('onClick', 'showInlineTSEntry()')
    } else if(action === 'timeClick') {
        dayInlineTSClick = true
        $('#unsaved-inline-ts-continue').removeAttr('onclick').attr('onClick', 'showInlineTimeEntry()')
    } else if(action === 'deleteRow'){
        $('#unsaved-inline-ts-continue').removeAttr('onclick').attr('onClick', 'deleteInlineTS()')
    } else if(action === 'showTimeSheet'){
        $('#unsaved-inline-ts-continue').removeAttr('onclick').attr('onClick', 'showTimeSheetPage()')
    } else if(action === 'showTimeSheet'){
        $('#unsaved-inline-ts-continue').removeAttr('onclick').attr('onClick', 'showTimeSheetPage()')
    } else if(action === 'addTimeSheet'){
        $('#unsaved-inline-ts-continue').removeAttr('onclick').attr('onClick', 'addTimeSheetPage()')
    } else if(action === 'backToLaunchPage'){
        $('#unsaved-inline-ts-continue').removeAttr('onclick').attr('onClick', 'backToLaunchPageSec()')
    }  else if(action === 'addTimeSheeTotalStatus'){
        $('#unsaved-inline-ts-continue').removeAttr('onclick').attr('onClick', 'addTimeSheeTotalStatussec()')
    } else {
        $('#unsaved-inline-ts-continue').removeAttr('onclick').attr('onClick', 'closeInlineTsEntry()')
    }
}
function deleteInlineTS(){
    const selectedDate = selectedDayTs.closest(".day").attr('data-date')
    if(selectedDayTs.closest('div.trow').next().length < 1) {
        selectedDayTs.closest('div.trow').prev().addClass('active').removeClass('taddedrow') 
        selectedDayTs.closest('div.trow').removeClass('active')
        selectedDayTs.closest('div.trow').prev().find('.add-inline-btn').show()
        $('.trow.timesheet-entry.active').find('.timesheet-entry-FSLABB_OtherOrderType__c .delete-text').css({'pointer-events': 'unset'})
        $('.trow.timesheet-entry.active').find('.timesheet-entry-FSLABB_SAPId__c input').css({'pointer-events': 'unset'})
        if (isActiveTimesheetEntryDataDirty() && areMandatoryFilled()) {
            selectedDayTs.closest('div.trow').prev().find('.add-inline-btn').attr('disabled', false)
        }          
if(selectedDayTs.closest('.inline-form-container').hasClass("global_create")){
            if(selectedDayTs.closest('.global_create').find(".trow.tbody").length===2){
                $(".timesheet-entry-date input").attr("disabled", false) 
            }     
             
        }            
    }
    $(".inline-timesheet-entry-table").find('div.tbody.trow.active .timesheet-entry-start-time input').attr('disabled',false);
    $(".inline-timesheet-entry-table").find('div.tbody.trow.active .timesheet-entry-end-time input').attr('disabled',false);
    $(".inline-timesheet-entry-table").find('div.tbody.trow.active .timesheet-entry-duration input').attr('disabled',false);
    $(".inline-timesheet-entry-table").find('div.tbody.trow.active .timesheet-entry-FSLABB_OtherOrderType__c input').attr('disabled',false);
    //$('.trow.timesheet-entry.taddedrow').find('.timesheet-entry-FSLABB_OtherOrderType__c .delete-text').css({'pointer-events': 'unset'})
    //$('.trow.timesheet-entry.taddedrow').find('.timesheet-entry-FSLABB_SAPId__c input').css({'pointer-events': 'unset'})
    selectedDayTs.closest('div.trow').remove()
    if($(".inline-timesheet-entry-table").find("div.tbody.trow").length == 1){
        $(".inline-timesheet-entry-table").find('div.tbody.trow .delete-ts-entry').hide()
        $(".inline-timesheet-entry-table").find('div.tbody.trow .add-inline-btn').show()        
        if (isActiveTimesheetEntryDataDirty() && areMandatoryFilled()) {
            $('button.inline-save-btn').attr('disabled', false)
            $(".inline-timesheet-entry-table").find('div.tbody.trow:first .add-inline-btn').attr('disabled', false)
        }
        else {
            $('button.inline-save-btn').attr('disabled', true)
        }
    }
    $('#unsaved-inline-ts').removeClass('active')
    $('#overlay').removeClass('active')
    enableDisableButtons()
}
function showInlineTSEntry() {
    $('#unsaved-inline-ts').removeClass('active')
    $('#overlay').removeClass('active')
    hideInlineTSE()
    dayInlineTSClick = false
    addTSLineTotalStatus(selectedDayTs)
}
function showInlineTimeEntry() {
    $('#unsaved-inline-ts').removeClass('active')
    $('#overlay').removeClass('active')
    hideInlineTSE()
    dayInlineTSClick = false
    onClickTimeSlot(selectedDayTs)
}
function showTimeSheetPage(){
    $('#unsaved-inline-ts').removeClass('active')
    $('#overlay').removeClass('active')
    hideInlineTSE()
    dayInlineTSClick = false
    showTimesheetView()

}
function addTimeSheetPage(){
    $('#unsaved-inline-ts').removeClass('active')
    $('#overlay').removeClass('active')
    hideInlineTSE()
    dayInlineTSClick = false
    addTimeSheetEntry('day')

}
function backToLaunchPageSec(){
    $('#unsaved-inline-ts').removeClass('active')
    $('#overlay').removeClass('active')
    hideInlineTSE()
    dayInlineTSClick = false
    backToLaunchPage();

}
function addTimeSheeTotalStatussec(){
    $('#unsaved-inline-ts').removeClass('active')
    $('#overlay').removeClass('active')
    hideInlineTSE()
    dayInlineTSClick = false
    addTimeSheeTotalStatus();

}

function populateLookupField(row) {
    // Get data-sfid attribute from the th that was clicked
    var rowSFID = $(row).attr('data-sfid')
    var rowSFAPI = $(row).closest('.lookup').attr('id')
    // Get .record-name of the th clicked
    var rowName = $('td.value', row).text()

    // Get original tse launching field
    var tseField = $(selectedLookUp)
    // If Absence Type
    if (rowSFAPI == 'FSLABB_Absence_Type') {
        // Get description attribute value
        var rowDescription = $(row).attr('data-description')

        // Set data-description attribute of original tse launching field
        $(tseField).attr('data-description', rowDescription)
    }

    // If Allowance type
    if (rowSFAPI = 'FSLABB_Allowance_Type__c') {
        // Get description attribute value
        var rowCurrency = $(row).attr('data-iscurrency')

        // Set data-iscurrency attribute of original tse launching field
        $(tseField).attr('data-iscurrency', rowCurrency)
    }
    // Set data-id attribute of original tse launching field
    $(tseField).attr('data-id', rowSFID)

    // Set value of orginal tse launching field & Trigger change event
    $(tseField).val(rowName).change()

    // Close popup / overlay
    closePopUps()
}

function populatePicklistField(row, flag=false) {
    if(flag) {
    // Get content & sfapi of li clicked
    var rowContent = $(row).text()
    var rowSFID = $(row).attr('data-sfid')
    var rowProductId = $(row).attr('data-productid')
    var rowSFAPI = $(row).closest('.picklist').attr('id')
    if (rowSFID != '') {
        // Set data-id attribute of original tse launching field
        $('div#parts-form-wrapper div[data-sfapi="' + rowSFAPI + '"] input').attr('data-id', rowSFID)
        $('div#parts-form-wrapper div[data-sfapi="' + rowSFAPI + '"] input').attr('data-productid', rowProductId)
        // Set value of original TSE launching field & Trigger change event
        $('div#parts-form-wrapper div[data-sfapi="' + rowSFAPI + '"] input').val(rowContent).change()
    }
    // Close popup / overlay
    closePopUps()
    }
    // Get content & sfapi of li clicked
    else {
    var rowContent = $(row).text()
    var rowSFID = $(row).attr('data-sfid')
    var rowSFAPI = $(row).closest('.picklist').attr('id')

    // Set data-id attribute of original tse launching field
    $(selectedPickUp).attr('data-id', rowSFID)

    // Set value of original TSE launching field & Trigger change event
    $(selectedPickUp).val(rowContent).change()

    // Close popup / overlay
    closePopUps()
    }
}

// For US-95266
function openDescriptionPopup(ele) {
    if ($('div.inline-form-container.timesheet-entry-content').hasClass('view')) {
        $('#description_popup #close_btn').show()
        $('#description_popup #clear_btn').hide()
        $('#description_popup #ok_btn').hide()
        $('#description_popup textarea').attr('readonly', true)
        $('div.lookup-actions.description-buttons').css("justify-content", "flex-end")
    } else {
        $('#description_popup #close_btn').hide()
        $('#description_popup #clear_btn').show()
        $('#description_popup #ok_btn').show()
        $('#description_popup textarea').attr('readonly', false)
    }
    $(ele).parent().addClass('current')
    $('#description_popup').toggleClass('active')
    $('#overlay').toggleClass('active')
    $('#description_popup textarea').val($(ele).val())
    $('#description_popup textarea').focus()
}

function saveDescription(ele) {
    var textAreaParent = $(ele).parent().siblings('.lookup-content')
    console.log("Description => ", $('textarea', textAreaParent).val())
    $('div.tcolumn.timesheet-entry-description.current textarea', '#inline-entry-table').val($('textarea', textAreaParent).val())
    $('div.tcolumn.timesheet-entry-description.current', '#inline-entry-table').removeClass('current')
    $('textarea', textAreaParent).val('')
    enableDisableButtons()
}

function clearDescription(ele) {
    var textAreaParent = $(ele).parent().siblings('.lookup-content')
    $('textarea', textAreaParent).val('')
}

function decideDescriptionFieldVisibility(fieldName) {
    var descriptionFeatureQuery = `SELECT FSLABB_Work_Order_Related__c as 'Work Order Related', FSLABB_Non_Work_Order_Related__c as 'Non-Work Order Related'
    FROM FSLABB_FeatureEnablementConfig__mdt  
    WHERE IsActive__c = 'TRUE' 
    AND FSLABB_Feature__c ='Allowance Description Visibility'
    AND FSLABB_Originating_Country__c = "${userCountry}"
    AND (FSLABB_Division__c = "${userBusiness}" OR FSLABB_Division__c IS NULL)
    AND (FSLABB_Business_Unit__c like "${userBUID}%" OR FSLABB_Business_Unit__c IS NULL)
    AND (FSLABB_Product_Group__c like "${userProductGroup}%" OR FSLABB_Product_Group__c IS NULL)`
    
    var descriptionFeatureData = callJSAPI('select', {'query': descriptionFeatureQuery}, 'FSLABB_FeatureEnablementConfig__mdt')
    descriptionFeatureData.then( (results) => {
        logToConsole("Description visibility feature =>> " + JSON.stringify(results))
            var fieldContainer = $(`.timesheet-entry-description`)
            var fieldInput = $('textarea', fieldContainer)
        if (results && results.length > 0) {
            if (results[0]['Non-Work Order Related'] === 'FALSE') {
                fieldContainer.addClass('not-on-non-work-order')
                $("div[data-dependentKey='" + fieldName + "']").addClass('not-on-non-work-order')
            } else if (results[0]['Non-Work Order Related'] === 'Mandatory') {
                fieldInput.addClass('required-on-non-work-order-related')
            }
            if (results[0]['Work Order Related'] === 'FALSE') {
                fieldContainer.addClass('not-on-work-order')
                $("div[data-dependentKey='" + fieldName + "']").addClass('not-on-work-order')
            } else if (results[0]['Work Order Related'] === 'Mandatory') {
                fieldInput.addClass('required-on-work-order-related')
            }
        } else {
            if (userBusiness == 'IA') {
                fieldContainer.addClass('not-on-non-work-order')
                $("div[data-dependentKey='" + fieldName + "']").addClass('not-on-non-work-order')
                fieldContainer.addClass('not-on-work-order')
                $("div[data-dependentKey='" + fieldName + "']").addClass('not-on-work-order')
            }
        }
    })

}
(function($) {
    $.fn.inputFilter = function(inputFilter) {
        return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
            logToConsole('Place 1')
            if ((this.value).length < 1) {
                this.value = "";
                this.oldValue = "";
            } else if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.olSelectionEnd = this.selectionEnd;
            } else if (!inputFilter(this.value) && this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                // this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd, 'forward');
            } else {
                this.value = "";
            }
        });
    };
}(jQuery))