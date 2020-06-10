public with sharing class SmartRecordCreateController {

    @AuraEnabled
    public static Response createRecord(String imageData, String objectname, Map<String,String> fields) {
        Response result ;
        Map<String, String> cardInfo = new Map<String, String> (); // Map to hold information from License card
            // call the OCR api using global methods
        String MODELID = 'OCRModel'; // This is out of box model for OCR
        String TASK = 'CONTACT'; // This can be Contact, Table or Text.
        String SAMPLEID = ''; // String that you can pass in to tag the prediction. Optional. Can be any value, and is returned in the response.
        try {

            einsteinplay.Einstein_PredictionService einsteinService = new einsteinplay.Einstein_PredictionService(
                einsteinplay.Einstein_PredictionService.Types.OCR
            );
            // call and obtain response from the Einstein Prediction Service
            einsteinplay.Einstein_PredictionResult response = einsteinService.predictOcrBase64(MODELID,
                imageData,
                TASK,
                SAMPLEID
            );

            for (einsteinplay.Einstein_Probability probability: response.probabilities) {
                if (probability.attributes.tag != 'OTHER') {
                    cardInfo.put(probability.attributes.tag, probability.label);
                }
            }

            // Insert the sObject
            sObject sObj = Schema.getGlobalDescribe().get(objectname).newSObject();
            String[] personname = cardInfo.get('PERSON').split(' ');
            if(personname.size() > 0) {
                sObj.put('FirstName', personname[0]);
            }
            if(personname.size() > 1) {
                sObj.put('LastName', personname[1]);
            } else {
                sObj.put('LastName', personname[0]);
            }
            sObj.put(fields.get('ADDRESS'), cardInfo.get('ADDRESS'));
            sObj.put(fields.get('PHONE'), cardInfo.get('PHONE'));
            sObj.put(fields.get('MOBILE_PHONE'), cardInfo.get('MOBILE_PHONE'));
            sObj.put(fields.get('EMAIL'), cardInfo.get('EMAIL'));
            sObj.put(fields.get('WEBSITE'), cardInfo.get('WEBSITE'));
            sObj.put(fields.get('ORG'), cardInfo.get('ORG'));
            insert sObj;
            
            result = new Response(true, '', (String)sObj.get('Id'));
            } catch(exception e) {
                result = new Response(false, e.getMessage(), null);
                throw new AuraHandledException('Error occurred' + e.getMessage());
            } 
        return result;
    }

    public with sharing class Response {
        @AuraEnabled
        public Boolean isSuccess {get;set;}
        @AuraEnabled
        public String errorMessage {get;set;}
        @AuraEnabled
        public String recordId {get;set;}

        public Response(Boolean isSuccess, String errorMessage, String recordId) {
            this.isSuccess = isSuccess;
            this.errorMessage = errorMessage;
            this.recordId = recordId;
        }
    }
}
