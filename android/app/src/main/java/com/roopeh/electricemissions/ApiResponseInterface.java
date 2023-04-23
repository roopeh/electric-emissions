package com.roopeh.electricemissions;

import com.github.mikephil.charting.data.Entry;

import java.util.ArrayList;

public interface ApiResponseInterface {
    void onResponse(ApiConnector.ResponseTypes apiResponseType, ArrayList<Entry> emissions);
    void onError(int errCode, String errMsg);
}
