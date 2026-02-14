package com.example.mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.mobile.network.RetrofitClient
import kotlinx.coroutines.launch

class DashboardActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        val profileCard = findViewById<android.view.ViewGroup>(R.id.profileCard)
        val loadingView = findViewById<ProgressBar>(R.id.progressBar)
        val tvUsername = findViewById<TextView>(R.id.tvUsername)
        val tvFirstName = findViewById<TextView>(R.id.tvFirstName)
        val tvLastName = findViewById<TextView>(R.id.tvLastName)
        val tvEmail = findViewById<TextView>(R.id.tvEmail)
        val btnLogout = findViewById<Button>(R.id.btnLogout)

        val prefs = getSharedPreferences("auth", MODE_PRIVATE)
        val token = prefs.getString("token", null)

        if (token == null) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.authApi.me("Bearer $token")
                if (response.isSuccessful) {
                    val user = response.body()!!
                    loadingView.visibility = android.view.View.GONE
                    profileCard.visibility = android.view.View.VISIBLE
                    tvUsername.text = user.username
                    tvFirstName.text = user.firstName
                    tvLastName.text = user.lastName
                    tvEmail.text = user.email
                } else {
                    loadingView.visibility = android.view.View.GONE
                    Toast.makeText(this@DashboardActivity, "Session expired", Toast.LENGTH_SHORT).show()
                    prefs.edit().clear().apply()
                    startActivity(Intent(this@DashboardActivity, LoginActivity::class.java))
                    finish()
                }
            } catch (e: Exception) {
                loadingView.visibility = android.view.View.GONE
                Toast.makeText(this@DashboardActivity, "Failed to load profile", Toast.LENGTH_SHORT).show()
            }
        }

        btnLogout.setOnClickListener {
            prefs.edit().clear().apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}
