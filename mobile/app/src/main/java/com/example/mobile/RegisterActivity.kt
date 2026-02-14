package com.example.mobile

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.mobile.model.RegisterRequest
import com.example.mobile.network.RetrofitClient
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etFirstName = findViewById<EditText>(R.id.etFirstName)
        val etLastName = findViewById<EditText>(R.id.etLastName)
        val etUsername = findViewById<EditText>(R.id.etUsername)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnRegister = findViewById<Button>(R.id.btnRegister)
        val tvGoLogin = findViewById<TextView>(R.id.tvGoLogin)

        btnRegister.setOnClickListener {
            val req = RegisterRequest(
                username = etUsername.text.toString().trim(),
                email = etEmail.text.toString().trim(),
                password = etPassword.text.toString().trim(),
                firstName = etFirstName.text.toString().trim(),
                lastName = etLastName.text.toString().trim()
            )

            lifecycleScope.launch {
                try {
                    val response = RetrofitClient.authApi.register(req)
                    if (response.isSuccessful) {
                        Toast.makeText(this@RegisterActivity, "Registered successfully", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        val errMsg = response.errorBody()?.string() ?: "Registration failed"
                        Toast.makeText(this@RegisterActivity, errMsg, Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@RegisterActivity, "Registration failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        tvGoLogin.setOnClickListener { finish() }
    }
}
