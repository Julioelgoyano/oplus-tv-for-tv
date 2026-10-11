package com.oplustv.tv;

import android.os.Bundle;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/**
 * O-PLUS TV para proyector / Smart TV.
 * El control remoto infrarrojo del proyector le llega a Android como teclas normales (flechas, OK, menú...).
 * Aquí se interceptan y se mandan a la página como eventos "tvkey", para que funcionen igual en cualquier WebView.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Proyector: la pantalla nunca se apaga mientras la app está abierta.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    private void hideBars() {
        Window w = getWindow();
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(w, w.getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }

    /** Nombre de la acción que la página entiende para cada tecla del control remoto (null = dejar que Android la maneje). */
    private static String actionFor(int code) {
        switch (code) {
            case KeyEvent.KEYCODE_DPAD_UP: return "up";
            case KeyEvent.KEYCODE_DPAD_DOWN: return "down";
            case KeyEvent.KEYCODE_DPAD_LEFT: return "left";
            case KeyEvent.KEYCODE_DPAD_RIGHT: return "right";
            case KeyEvent.KEYCODE_DPAD_CENTER:
            case KeyEvent.KEYCODE_ENTER:
            case KeyEvent.KEYCODE_NUMPAD_ENTER: return "ok";
            // Botón INFO / ≡ (tres líneas, "hamburguesa"): muestra u oculta la barra de información del canal.
            case KeyEvent.KEYCODE_MENU:
            case KeyEvent.KEYCODE_INFO:
            case KeyEvent.KEYCODE_TV_CONTENTS_MENU:
            case KeyEvent.KEYCODE_TV_MEDIA_CONTEXT_MENU:
            case KeyEvent.KEYCODE_MEDIA_TOP_MENU: return "info";
            case KeyEvent.KEYCODE_SETTINGS: return "menu";   // engranaje: menú rápido
            case KeyEvent.KEYCODE_GUIDE: return "guide";
            case KeyEvent.KEYCODE_CHANNEL_UP:
            case KeyEvent.KEYCODE_PAGE_DOWN:
            case KeyEvent.KEYCODE_MEDIA_NEXT: return "chup";
            case KeyEvent.KEYCODE_CHANNEL_DOWN:
            case KeyEvent.KEYCODE_PAGE_UP:
            case KeyEvent.KEYCODE_MEDIA_PREVIOUS: return "chdown";
            case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE:
            case KeyEvent.KEYCODE_MEDIA_PLAY:
            case KeyEvent.KEYCODE_MEDIA_PAUSE: return "pp";
            case KeyEvent.KEYCODE_PROG_RED: return "red";
            case KeyEvent.KEYCODE_PROG_GREEN: return "green";
            case KeyEvent.KEYCODE_PROG_YELLOW: return "yellow";
            case KeyEvent.KEYCODE_PROG_BLUE: return "blue";
            default: return null;
        }
    }

    private void js(String code) {
        if (getBridge() == null) return;
        WebView wv = getBridge().getWebView();
        if (wv != null) wv.evaluateJavascript(code, null);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        int code = e.getKeyCode();
        boolean down = e.getAction() == KeyEvent.ACTION_DOWN;

        // "Probar control remoto": la página muestra el código de cualquier tecla que llegue.
        if (down && e.getRepeatCount() == 0) {
            js("window.__rk&&window.__rk(" + code + ",'" + KeyEvent.keyCodeToString(code) + "')");
        }

        String action = actionFor(code);
        if (action != null) {
            if (down) {
                boolean arrow = action.equals("up") || action.equals("down") || action.equals("left") || action.equals("right");
                // Las flechas se repiten al mantenerlas apretadas (para recorrer la lista); el resto, solo una vez.
                if (e.getRepeatCount() == 0 || arrow) {
                    js("window.dispatchEvent(new CustomEvent('tvkey',{detail:'" + action + "'}))");
                }
            }
            return true;   // la tecla ya fue atendida (bajada y subida)
        }
        return super.dispatchKeyEvent(e);   // volumen, atrás, inicio, números, etc.: como siempre
    }
}
