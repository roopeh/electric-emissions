package com.roopeh.electricemissions;

import com.github.mikephil.charting.data.Entry;

import java.util.ArrayList;

public interface ApiResponseInterface {
    void onApiResponse(ApiConnector.ResponseTypes apiResponseType, ArrayList<Entry> emissions);
    void onApiError(int errCode, String errMsg);
}
