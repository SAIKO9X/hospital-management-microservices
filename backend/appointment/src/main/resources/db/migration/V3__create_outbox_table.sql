CREATE TABLE outbox_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_type VARCHAR(255) NOT NULL, -- ex: 'Appointment'
    aggregate_id VARCHAR(255) NOT NULL,   -- O ID da consulta
    event_type VARCHAR(255) NOT NULL,     -- ex: 'AppointmentStatusChangedEvent'
    payload TEXT NOT NULL,                -- O JSON do evento
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Índice para acelerar a busca do Scheduler
CREATE INDEX idx_outbox_unprocessed ON outbox_events(processed, created_at);
