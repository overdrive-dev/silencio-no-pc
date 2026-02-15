package com.kidspc.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kidspc.app.data.AppConfig
import com.kidspc.app.data.SyncRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PairingUiState(
    val token: String = "",
    val loading: Boolean = false,
    val error: String? = null,
    val paired: Boolean = false,
)

@HiltViewModel
class PairingViewModel @Inject constructor(
    private val config: AppConfig,
    private val syncRepo: SyncRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PairingUiState())
    val uiState: StateFlow<PairingUiState> = _uiState.asStateFlow()

    fun onTokenChange(token: String) {
        _uiState.value = _uiState.value.copy(token = token.filter { it.isDigit() }, error = null)
    }

    fun claim() {
        val token = _uiState.value.token
        if (token.length != 6) return

        _uiState.value = _uiState.value.copy(loading = true, error = null)

        viewModelScope.launch {
            try {
                val result = syncRepo.claimToken(token)
                if (result != null) {
                    config.pcId = result.pcId
                    config.userId = result.userId
                    config.isPaired = true
                    _uiState.value = _uiState.value.copy(loading = false, paired = true)
                } else {
                    _uiState.value = _uiState.value.copy(
                        loading = false,
                        error = "Código inválido ou expirado. Tente novamente.",
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    loading = false,
                    error = "Erro de conexão. Verifique sua internet.",
                )
            }
        }
    }
}
