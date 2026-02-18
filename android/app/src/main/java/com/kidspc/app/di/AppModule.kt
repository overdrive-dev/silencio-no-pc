package com.kidspc.app.di

import android.content.Context
import com.kidspc.app.BuildConfig
import com.kidspc.app.data.AppConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideAppConfig(@ApplicationContext context: Context): AppConfig {
        return AppConfig(context)
    }

    @Provides
    @Singleton
    fun provideSupabaseClient(config: AppConfig): SupabaseClient {
        return createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY
        ) {
            // Use per-device JWT for row-scoped RLS when available
            val jwt = config.deviceJwt
            if (jwt.isNotBlank()) {
                accessToken = { jwt }
            }
            install(Postgrest)
        }
    }
}
