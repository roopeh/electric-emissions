package com.roopeh.electricemissions;

import android.content.Context;
import android.content.res.Resources;
import android.os.Build;
import android.os.LocaleList;

import java.util.Locale;

public class ContextWrapper extends android.content.ContextWrapper {
    public ContextWrapper(Context base) {
        super(base);
    }

    public static ContextWrapper wrap(Context context, Locale newLocale) {
        final Resources res = context.getResources();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            res.getConfiguration().setLocale(newLocale);

            final LocaleList localeList = new LocaleList(newLocale);
            LocaleList.setDefault(localeList);
            res.getConfiguration().setLocales(localeList);

            context = context.createConfigurationContext(res.getConfiguration());
        } else {
            res.getConfiguration().locale = newLocale;
            res.updateConfiguration(res.getConfiguration(), res.getDisplayMetrics());
        }

        return new ContextWrapper(context);
    }
}
