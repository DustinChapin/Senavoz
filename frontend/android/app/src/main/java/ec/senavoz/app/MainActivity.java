package ec.senavoz.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VoiceSetupPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
