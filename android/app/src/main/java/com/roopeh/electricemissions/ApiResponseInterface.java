package com.roopeh.electricemissions;

import java.util.ArrayList;

public interface ApiResponseInterface {
    void onApiResponse(ApiConnector.ResponseTypes apiResponseType, ArrayList<RawEmissionEntry> rawEmissions, boolean isCached);
    void onApiError(ApiConnector.ResponseTypes apiResponseType, int errCode, String errMsg);
}
