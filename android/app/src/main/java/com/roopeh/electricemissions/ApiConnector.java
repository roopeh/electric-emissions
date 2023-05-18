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
import java.time.Duration;
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
        PRODUCTION_EMISSIONS,
        CURRENT_EMISSIONS
    }

    private static Gson gson = null;

    // Cached current emissions
    private static ZonedDateTime mLastRefreshTime = null;
    private static ArrayList<RawEmissionEntry> mLastCachedCurrentEmissions = null;

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
            responseInterface.onApiResponse(responseType, parseRawEmissionsFromString(new String(buffer, StandardCharsets.UTF_8)), false);
        } catch (IOException err) {
            responseInterface.onApiError(500, "Unknown parse error when parsing data");
            err.printStackTrace();
        }
    }

    public static void loadConsumedData(ApiResponseInterface responseInterface) {
        // Change timezone to GMt+0 to match API timezone
        final ZonedDateTime startDate = LocalStore.getInstance().getStartDate().withZoneSameInstant(ZoneId.of("GMT+0"));
        final ZonedDateTime endDate = LocalStore.getInstance().getEndDate().withZoneSameInstant(ZoneId.of("GMT+0"));

        final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault());
        final String apiUrl = "https://api.fingrid.fi/v1/variable/265/events/json?start_time="
                + startDate.format(formatter) + "&end_time=" + endDate.format(formatter);
        final ApiRequest request = new ApiRequest(apiUrl,
            response -> {
                final ArrayList<RawEmissionEntry> result = parseRawEmissionsFromString(response);
                responseInterface.onApiResponse(ResponseTypes.CONSUMED_EMISSIONS, result, false);
            }, error -> {
                final Pair<Integer, String> errBody = handleApiError(ResponseTypes.CONSUMED_EMISSIONS, error.networkResponse.statusCode);
                responseInterface.onApiError(errBody.first, errBody.second);
                error.printStackTrace();
        });

        ApplicationController.getInstance().addToRequestQueue(request);
    }

    public static void loadProductionData(ApiResponseInterface responseInterface) {
        // Change timezone to GMt+0 to match API timezone
        final ZonedDateTime startDate = LocalStore.getInstance().getStartDate().withZoneSameInstant(ZoneId.of("GMT+0"));
        final ZonedDateTime endDate = LocalStore.getInstance().getEndDate().withZoneSameInstant(ZoneId.of("GMT+0"));

        final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.getDefault());
        final String apiUrl = "https://api.fingrid.fi/v1/variable/266/events/json?start_time="
                + startDate.format(formatter) + "&end_time=" + endDate.format(formatter);
        final ApiRequest request = new ApiRequest(apiUrl,
            response -> {
                final ArrayList<RawEmissionEntry> result = parseRawEmissionsFromString(response);
                responseInterface.onApiResponse(ResponseTypes.PRODUCTION_EMISSIONS, result, false);
            }, error -> {
                final Pair<Integer, String> errBody = handleApiError(ResponseTypes.PRODUCTION_EMISSIONS, error.networkResponse.statusCode);
                responseInterface.onApiError(errBody.first, errBody.second);
                error.printStackTrace();
        });

        ApplicationController.getInstance().addToRequestQueue(request);
    }

    public static void loadCurrentData(ApiResponseInterface responseInterface, boolean initialLoad) {
        final ZonedDateTime curDate = ZonedDateTime.now();

        // Get new current emission values every 1 minutes
        // otherwise return cached values
        if (mLastRefreshTime != null) {
            final Duration duration = Duration.between(curDate, mLastRefreshTime).abs();
            if (duration.getSeconds() < 60) {
                responseInterface.onApiResponse(ResponseTypes.CURRENT_EMISSIONS, mLastCachedCurrentEmissions, true);
                return;
            }
        }

        mLastRefreshTime = curDate;

        final String apiUrl = "https://api.fingrid.fi/v1/variable/event/json/265,266";
        final ApiRequest request = new ApiRequest(apiUrl,
            response -> {
                final ArrayList<RawEmissionEntry> result = parseRawEmissionsFromString(response);
                mLastCachedCurrentEmissions = result;
                // Tell MainActivity it's a cached value on initial load to prevent double API fetch
                responseInterface.onApiResponse(ResponseTypes.CURRENT_EMISSIONS, result, initialLoad);
            }, error -> {
                final Pair<Integer, String> errBody = handleApiError(ResponseTypes.CURRENT_EMISSIONS, error.networkResponse.statusCode);
                responseInterface.onApiError(errBody.first, errBody.second);
                error.printStackTrace();
        });

        ApplicationController.getInstance().addToRequestQueue(request);
    }

    public static ArrayList<Entry> parseEntriesFromRawEmissions(ArrayList<RawEmissionEntry> rawEmissions) {
        final ArrayList<Entry> emissions = new ArrayList<>();
        for (int i = 0; i < rawEmissions.size(); ++i) {
            final EmissionEntry parsedEmission = new EmissionEntry(rawEmissions.get(i));
            emissions.add(new Entry(parsedEmission.getUnixTime(), parsedEmission.getValue()));
        }
        return emissions;
    }

    private static ArrayList<RawEmissionEntry> parseRawEmissionsFromString(String rawString) {
        final Type typeToken = new TypeToken<ArrayList<RawEmissionEntry>>(){}.getType();
        return gson.fromJson(rawString, typeToken);
    }

    private static Pair<Integer, String> handleApiError(ResponseTypes responseType, int errCode) {
        final String errMsg;
        if (errCode == 503) {
            errMsg = "Api is down for maintenance";
        } else if (errCode == 416) {
            errMsg = "Time between start date and end date is too large";
        } else if (errCode == 422 || errCode == 400) {
            errMsg = "Invalid date values";
        } else if (responseType == ResponseTypes.CURRENT_EMISSIONS && errCode == 500) {
            errMsg = "Invalid parameters for current emissions";
        } else {
            errMsg = "Unknown error while fetching data";
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
