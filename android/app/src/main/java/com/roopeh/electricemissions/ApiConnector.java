package com.roopeh.electricemissions;

import android.content.Context;
import android.text.format.DateFormat;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class ApiConnector {
    private static Gson gson = null;

    public static void initializeApiConnector() {
        if (gson != null) {
            return;
        }
        gson = new Gson();
    }

    // Returns sample consumed emissions data in JSON from assets
    public static ArrayList<EmissionEntry> getSampleConsumedData(Context context) {
        String rawJson = "";
        try {
            final InputStream is = context.getAssets().open("sampleData/consumed.json");
            final int size = is.available();
            final byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            rawJson = new String(buffer, StandardCharsets.UTF_8);
        } catch (IOException err) {
            err.printStackTrace();
            return null;
        }

        final Type typeToken = new TypeToken<ArrayList<RawEmissionEntry>>(){}.getType();
        final ArrayList<RawEmissionEntry> rawEmissions = gson.fromJson(rawJson, typeToken);

        // Parse raw JSON data
        final ArrayList<EmissionEntry> emissions = new ArrayList<>();
        for (int i = 0; i < rawEmissions.size(); ++i) {
            emissions.add(i, new EmissionEntry(rawEmissions.get(i)));
        }
        return emissions;
    }
}
