import numpy as np
import pyaudio
from collections import deque
from threading import Thread, Event
from typing import Callable, Optional
import time

class AudioMonitor:
    def __init__(self, janela_segundos: int = 10, callback: Optional[Callable] = None):
        self.janela_segundos = janela_segundos
        self.callback = callback
        self._running = Event()
        self._thread: Optional[Thread] = None
        self._historico_db = deque(maxlen=janela_segundos * 10)  # 10 amostras/segundo
        self._nivel_atual = 0.0
        self._pico_atual = 0.0
        
        self.CHUNK = 1024
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = 1
        self.RATE = 44100
        
        self._pyaudio: Optional[pyaudio.PyAudio] = None
        self._stream = None
    
    def _calcular_db(self, data: bytes) -> float:
        audio_data = np.frombuffer(data, dtype=np.int16).astype(np.float64)
        if len(audio_data) == 0:
            return 0.0
        rms = np.sqrt(np.mean(audio_data ** 2))
        if rms < 1:
            return 0.0
        db = 20 * np.log10(rms / 32768.0) + 96
        return max(0, min(120, db))
    
    def _monitor_loop(self):
        try:
            self._pyaudio = pyaudio.PyAudio()
            self._stream = self._pyaudio.open(
                format=self.FORMAT,
                channels=self.CHANNELS,
                rate=self.RATE,
                input=True,
                frames_per_buffer=self.CHUNK
            )
            
            while self._running.is_set():
                try:
                    data = self._stream.read(self.CHUNK, exception_on_overflow=False)
                    db = self._calcular_db(data)
                    
                    self._nivel_atual = db
                    self._historico_db.append(db)
                    
                    if len(self._historico_db) > 0:
                        self._pico_atual = max(self._historico_db)
                    
                    if self.callback:
                        media = self.get_media()
                        self.callback(db, media, self._pico_atual)
                    
                    time.sleep(0.1)
                except Exception:
                    time.sleep(0.1)
                    
        except Exception as e:
            print(f"Erro no monitor de áudio: {e}")
        finally:
            self._cleanup()
    
    def _cleanup(self):
        if self._stream:
            try:
                self._stream.stop_stream()
                self._stream.close()
            except Exception:
                pass
        if self._pyaudio:
            try:
                self._pyaudio.terminate()
            except Exception:
                pass
    
    def start(self):
        if self._thread and self._thread.is_alive():
            return
        self._running.set()
        self._thread = Thread(target=self._monitor_loop, daemon=True)
        self._thread.start()
    
    def stop(self):
        self._running.clear()
        if self._thread:
            self._thread.join(timeout=2)
    
    def get_nivel_atual(self) -> float:
        return self._nivel_atual
    
    def get_media(self) -> float:
        if len(self._historico_db) == 0:
            return 0.0
        return sum(self._historico_db) / len(self._historico_db)
    
    def get_pico(self) -> float:
        return self._pico_atual
    
    def reset_historico(self):
        self._historico_db.clear()
        self._pico_atual = 0.0
    
