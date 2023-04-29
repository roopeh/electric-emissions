package com.roopeh.electricemissions;

import java.util.ArrayList;

public interface ApiResponseInterface {
    void onApiResponse(ApiConnector.ResponseTypes apiResponseType, ArrayList<RawEmissionEntry> rawEmissions);
    void onApiError(int errCode, String errMsg);
}
