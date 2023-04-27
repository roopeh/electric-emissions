package com.roopeh.electricemissions;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;

public class LoadingDialog extends DialogFragment {
    final private LoadingDialogInterface mInterface;
    public LoadingDialog(LoadingDialogInterface loadingDialogInterface) {
        mInterface = loadingDialogInterface;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        final AlertDialog.Builder builder = new AlertDialog.Builder(getActivity(), R.style.LoadingDialogTheme);
        builder.setView(R.layout.loading_dialog);

        final AlertDialog dialog = builder.create();
        dialog.getWindow().setDimAmount(0.4f);
        return dialog;
    }

    @Override
    public void onCancel(@NonNull DialogInterface dialog) {
        mInterface.onCancelLoadingDialog();
    }
}
