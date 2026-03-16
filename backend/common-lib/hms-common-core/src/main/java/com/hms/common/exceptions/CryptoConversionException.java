package com.hms.common.exceptions;

import org.springframework.http.HttpStatus;

// 500 - Erro Interno do Servidor (Falha ao ler/gravar dados sensíveis)
public class CryptoConversionException extends HmsBaseException {

  public CryptoConversionException(String message) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, "CRYPTO_CONVERSION_ERROR");
  }

  public CryptoConversionException(String message, Throwable cause) {
    super(message, cause, HttpStatus.INTERNAL_SERVER_ERROR, "CRYPTO_CONVERSION_ERROR");
  }
}