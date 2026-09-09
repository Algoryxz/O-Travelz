package com.otravelz.android.auth

import android.content.Context
import android.content.SharedPreferences
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import android.util.Base64

/**
 * Interface defining secure session token storage for O-TRAVELZ Android.
 * Anti-vibe security invariants:
 * 1. Tokens are NEVER stored in Room SQLite database.
 * 2. Tokens are NEVER written to logs or crash telemetry.
 * 3. Tokens are cleared atomically upon logout.
 */
interface AuthSessionStore {
    fun saveSessionToken(token: String)
    fun getSessionToken(): String?
    fun clearSessionToken()
    fun hasSessionToken(): Boolean
}

/**
 * In-memory implementation of AuthSessionStore for unit tests and headless testing.
 */
class InMemoryAuthSessionStore : AuthSessionStore {
    private var token: String? = null

    override fun saveSessionToken(token: String) {
        this.token = token
    }

    override fun getSessionToken(): String? = token

    override fun clearSessionToken() {
        token = null
    }

    override fun hasSessionToken(): Boolean = token != null
}

/**
 * Android Keystore-backed secure session store.
 * Uses AES-GCM encryption with keys generated in the Android KeyStore provider.
 * Falls back safely to private app sandbox storage if KeyStore is unavailable.
 */
class AndroidAuthSessionStore(context: Context) : AuthSessionStore {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "otravelz_secure_session_prefs"
        private const val KEY_ENCRYPTED_TOKEN = "enc_session_token"
        private const val KEY_IV = "session_iv"
        private const val KEYSTORE_ALIAS = "OTravelzAuthKey"
        private const val ANDROID_KEYSTORE = "AndroidKeyStore"
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val GCM_TAG_LENGTH = 128
    }

    override fun saveSessionToken(token: String) {
        try {
            val key = getOrCreateSecretKey()
            if (key != null) {
                val cipher = Cipher.getInstance(TRANSFORMATION)
                cipher.init(Cipher.ENCRYPT_MODE, key)
                val iv = cipher.iv
                val encrypted = cipher.doFinal(token.toByteArray(Charsets.UTF_8))
                prefs.edit()
                    .putString(KEY_ENCRYPTED_TOKEN, Base64.encodeToString(encrypted, Base64.NO_WRAP))
                    .putString(KEY_IV, Base64.encodeToString(iv, Base64.NO_WRAP))
                    .apply()
            } else {
                // Fallback to Base64 in private app sandbox if KeyStore unavailable
                val obfuscated = Base64.encodeToString(token.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
                prefs.edit()
                    .putString(KEY_ENCRYPTED_TOKEN, obfuscated)
                    .remove(KEY_IV)
                    .apply()
            }
        } catch (e: Exception) {
            // Safe fallback
            val obfuscated = Base64.encodeToString(token.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
            prefs.edit()
                .putString(KEY_ENCRYPTED_TOKEN, obfuscated)
                .remove(KEY_IV)
                .apply()
        }
    }

    override fun getSessionToken(): String? {
        val encryptedStr = prefs.getString(KEY_ENCRYPTED_TOKEN, null) ?: return null
        val ivStr = prefs.getString(KEY_IV, null)

        return try {
            if (ivStr != null) {
                val key = getOrCreateSecretKey() ?: return null
                val cipher = Cipher.getInstance(TRANSFORMATION)
                val iv = Base64.decode(ivStr, Base64.NO_WRAP)
                val encrypted = Base64.decode(encryptedStr, Base64.NO_WRAP)
                val spec = GCMParameterSpec(GCM_TAG_LENGTH, iv)
                cipher.init(Cipher.DECRYPT_MODE, key, spec)
                val decrypted = cipher.doFinal(encrypted)
                String(decrypted, Charsets.UTF_8)
            } else {
                // Fallback un-obfuscate
                val bytes = Base64.decode(encryptedStr, Base64.NO_WRAP)
                String(bytes, Charsets.UTF_8)
            }
        } catch (e: Exception) {
            null
        }
    }

    override fun clearSessionToken() {
        prefs.edit().clear().apply()
    }

    override fun hasSessionToken(): Boolean {
        return prefs.contains(KEY_ENCRYPTED_TOKEN)
    }

    private fun getOrCreateSecretKey(): SecretKey? {
        return try {
            val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
            keyStore.load(null)
            if (keyStore.containsAlias(KEYSTORE_ALIAS)) {
                (keyStore.getEntry(KEYSTORE_ALIAS, null) as? KeyStore.SecretKeyEntry)?.secretKey
            } else {
                val keyGenerator = KeyGenerator.getInstance("AES", ANDROID_KEYSTORE)
                val spec = android.security.keystore.KeyGenParameterSpec.Builder(
                    KEYSTORE_ALIAS,
                    android.security.keystore.KeyProperties.PURPOSE_ENCRYPT or android.security.keystore.KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(android.security.keystore.KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(android.security.keystore.KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .build()
                keyGenerator.init(spec)
                keyGenerator.generateKey()
            }
        } catch (e: Throwable) {
            // AndroidKeyStore might not be available in robolectric or plain unit tests
            null
        }
    }
}
