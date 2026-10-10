package ec.senavoz.app;

import android.content.Intent;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Abre las pantallas del sistema donde se descargan los paquetes de voz en español
 * (Android no permite instalarlos en silencio desde una app).
 */
@CapacitorPlugin(name = "VoiceSetup")
public class VoiceSetupPlugin extends Plugin {

    /** Reconocimiento de voz sin conexión (micrófono → texto), del servicio de Google. */
    @PluginMethod
    public void openOfflineSpeech(PluginCall call) {
        Intent googleOffline = new Intent()
            .setClassName(
                "com.google.android.googlequicksearchbox",
                "com.google.android.voicesearch.greco3.languagepack.InstallActivity"
            );
        Intent[] attempts = {
            googleOffline,
            new Intent("android.settings.VOICE_INPUT_SETTINGS"),
            new Intent(Settings.ACTION_SETTINGS),
        };
        finish(call, attempts);
    }

    /** Voz que lee en voz alta (texto → voz): instalación de datos del motor de voz. */
    @PluginMethod
    public void openTtsInstall(PluginCall call) {
        Intent[] attempts = {
            new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA),
            new Intent("com.android.settings.TTS_SETTINGS"),
            new Intent(Settings.ACTION_SETTINGS),
        };
        finish(call, attempts);
    }

    /** Prueba cada pantalla en orden y abre la primera que exista en este teléfono. */
    private void finish(PluginCall call, Intent[] attempts) {
        for (int i = 0; i < attempts.length; i++) {
            try {
                attempts[i].addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(attempts[i]);
                JSObject result = new JSObject();
                result.put("exact", i == 0);
                call.resolve(result);
                return;
            } catch (Exception ignored) {
                // se prueba la siguiente
            }
        }
        call.reject("No se pudo abrir la configuración de voz.");
    }
}
