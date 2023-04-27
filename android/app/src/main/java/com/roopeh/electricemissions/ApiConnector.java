package com.roopeh.electricemissions;

import android.content.Context;
import android.util.Pair;

import com.android.volley.Response;
import com.android.volley.toolbox.StringRequest;
import com.github.mikephil.charting.data.Entry;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class ApiConnector {
    public enum ResponseTypes {
        CONSUMED_EMISSIONS,
        PRODUCTION_EMISSIONS
    }

    private static Gson gson = null;

    // For debugging
    final public static boolean useSampleData = false;

    public static void initializeApiConnector() {
        if (gson != null) {
            return;
        }
        gson = new Gson();
    }

    // Returns sample emission data from provided file name in assets
    @SuppressWarnings("ResultOfMethodCallIgnored")
    public static void getSampleDataFromFile(ApiResponseInterface responseInterface, Context context, String fileName) {
        final ResponseTypes responseType = fileName.equals("production.json")
                ? ResponseTypes.PRODUCTION_EMISSIONS
                : ResponseTypes.CONSUMED_EMISSIONS;
        try {
            final InputStream is = context.getAssets().open("sampleData/" + fileName);
            final int size = is.available();
            final byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            responseInterface.onApiResponse(responseType, parseEmissionsFromRawString(new String(buffer, StandardCharsets.UTF_8)));
        } catch (IOException err) {
            responseInterface.onApiError(500, "Unknown parse error when parsing data");
            err.printStackTrace();
        }
    }

    public static void loadConsumedData(ApiResponseInterface responseInterface, ZonedDateTime startDate, ZonedDateTime endDate) {
        // Change timezone to GMt+0 to match API timezone
        startDate = startDate.withZoneSameInstant(ZoneId.of("GMT+0"));
        endDate = endDate.withZoneSameInstant(ZoneId.of("GMT+0"));
        final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault());
        final String apiUrl = "https://api.fingrid.fi/v1/variable/265/events/json?start_time="
                + startDate.format(formatter) + "&end_time=" + endDate.format(formatter);
        final ApiRequest request = new ApiRequest(apiUrl,
            response -> {
                final ArrayList<Entry> result = parseEmissionsFromRawString(response);
                responseInterface.onApiResponse(ResponseTypes.CONSUMED_EMISSIONS, result);
            }, error -> {
                final Pair<Integer, String> errBody = handleApiError(error.networkResponse.statusCode);
                responseInterface.onApiError(errBody.first, errBody.second);
                error.printStackTrace();
        });

        ApplicationController.getInstance().addToRequestQueue(request);
    }

    public static void loadProductionData(ApiResponseInterface responseInterface, ZonedDateTime startDate, ZonedDateTime endDate) {
        // Change timezone to GMt+0 to match API timezone
        startDate = startDate.withZoneSameInstant(ZoneId.of("GMT+0"));
        endDate = endDate.withZoneSameInstant(ZoneId.of("GMT+0"));
        final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault());
        final String apiUrl = "https://api.fingrid.fi/v1/variable/266/events/json?start_time="
                + startDate.format(formatter) + "&end_time=" + endDate.format(formatter);
        final ApiRequest request = new ApiRequest(apiUrl,
            response -> {
                final ArrayList<Entry> result = parseEmissionsFromRawString(response);
                responseInterface.onApiResponse(ResponseTypes.PRODUCTION_EMISSIONS, result);
            }, error -> {
                final Pair<Integer, String> errBody = handleApiError(error.networkResponse.statusCode);
                responseInterface.onApiError(errBody.first, errBody.second);
                error.printStackTrace();
        });

        ApplicationController.getInstance().addToRequestQueue(request);
    }

    private static ArrayList<Entry> parseEmissionsFromRawString(String rawString) {
        final Type typeToken = new TypeToken<ArrayList<RawEmissionEntry>>(){}.getType();
        final ArrayList<RawEmissionEntry> rawEmissions = gson.fromJson(rawString, typeToken);

        // Parse raw JSON data
        final ArrayList<Entry> emissions = new ArrayList<>();
        for (int i = 0; i < rawEmissions.size(); ++i) {
            final EmissionEntry parsedEmission = new EmissionEntry(rawEmissions.get(i));
            emissions.add(new Entry(parsedEmission.getUnixTime(), parsedEmission.getValue()));
        }
        return emissions;
    }

    private static Pair<Integer, String> handleApiError(int errCode) {
        final String errMsg;
        switch (errCode) {
            case 503:
                errMsg = "Api is down for maintenance";
                break;
            case 416:
                errMsg = "Time between start date and end date is too large";
                break;
            case 422:
            case 400:
                errMsg = "Invalid date values";
                break;
            default:
                errMsg = "Unknown error while fetching data";
                break;
        }

        return new Pair<>(errCode, errMsg);
    }

    private static class ApiRequest extends StringRequest {
        public ApiRequest(String apiUrl, Response.Listener<String> listener, Response.ErrorListener error) {
            super(Method.GET, apiUrl, listener, error);
        }

        @Override
        public Map<String, String> getHeaders() {
            final Map<String, String> headers = new HashMap<>();
            // TODO: api key
            headers.put("x-api-key", "");
            return headers;
        }
    }
}
