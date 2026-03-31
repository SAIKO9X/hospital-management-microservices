-- ============================================================
-- V2__seed_billing.sql
-- Seed inicial do billing-service: Seguros e Faturas
--
-- NOTAS:
-- * patient_id e doctor_id referenciam o USER_ID da tabela tb_users.
-- * appointment_id referencia o ID da consulta (appointment-service).
-- * Coberturas: Unimed (80%), Amil (50%).
-- * Taxas base: Demo (150), Carlos (250), Ana Paula (180), Roberto (200), Mariana (170), Paulo (220).
-- * As datas das faturas acompanham dinamicamente os últimos 30 dias.
-- ============================================================

-- ============================================================
-- 1. SEGUROS DE SAÚDE DOS PACIENTES (Baseado no USER_ID)
-- ============================================================
INSERT IGNORE INTO tb_patient_insurances (patient_id, provider_id, policy_number, valid_until)
VALUES
    ('3', 1, 'UNIMED-POL-2024-0001', '2027-12-31'), -- Unimed 80% (Patient Demo, user_id=3)
    ('9', 2, 'AMIL-POL-2025-0009',   '2026-12-31'), -- Amil 50%   (João Silva, user_id=9)
    ('10', 1, 'UNIMED-POL-2025-0010', '2028-06-30'), -- Unimed 80% (Maria Santos, user_id=10)
    ('12', 1, 'UNIMED-POL-2025-0012', '2027-03-31'), -- Unimed 80% (Ana Costa, user_id=12)
    ('13', 2, 'AMIL-POL-2025-0013',   '2026-09-30'); -- Amil 50%   (Lucas Ferreira, user_id=13)

-- ============================================================
-- 2. FATURAS DE CONSULTAS CONCLUÍDAS (Datas Dinâmicas)
-- Status: PAID (Tudo pago), INSURANCE_PENDING (Aguardando seguro), PENDING (Aguardando paciente)
-- ============================================================
INSERT IGNORE INTO tb_invoices
    (appointment_id, pharmacy_sale_id, patient_id, doctor_id,
     total_amount, insurance_covered, patient_payable,
     status, issued_at, due_date, paid_at, patient_paid_at, insurance_paid_at)
VALUES
    -- 1. Demo (user=3) + Demo (user=2) | R$ 150 (Unimed 80% cobre 120, Paciente 30) -> PAID (Consulta -30 dias)
    (1, NULL, '3', '2', 150.00, 120.00, 30.00, 'PAID',
     TIMESTAMP(CURDATE() - INTERVAL 30 DAY, '10:35:00'),
     TIMESTAMP(CURDATE(), '10:35:00'), -- Vence hoje (30 dias depois)
     TIMESTAMP(CURDATE() - INTERVAL 29 DAY, '14:00:00'),
     TIMESTAMP(CURDATE() - INTERVAL 30 DAY, '11:00:00'),
     TIMESTAMP(CURDATE() - INTERVAL 29 DAY, '14:00:00')),

    -- 2. João (user=9) + Carlos (user=4) | R$ 250 (Amil 50% cobre 125, Paciente 125) -> INSURANCE_PENDING (Consulta -25 dias)
    (2, NULL, '9', '4', 250.00, 125.00, 125.00, 'INSURANCE_PENDING',
     TIMESTAMP(CURDATE() - INTERVAL 25 DAY, '14:35:00'),
     TIMESTAMP(CURDATE() + INTERVAL 5 DAY, '14:35:00'),
     NULL, NULL, NULL),

    -- 3. Maria (user=10) + Ana Paula (user=5) | R$ 180 (Unimed 80% cobre 144, Paciente 36) -> PAID (Consulta -20 dias)
    (3, NULL, '10', '5', 180.00, 144.00, 36.00, 'PAID',
     TIMESTAMP(CURDATE() - INTERVAL 20 DAY, '09:35:00'),
     TIMESTAMP(CURDATE() + INTERVAL 10 DAY, '09:35:00'),
     TIMESTAMP(CURDATE() - INTERVAL 19 DAY, '10:00:00'),
     TIMESTAMP(CURDATE() - INTERVAL 20 DAY, '10:00:00'),
     TIMESTAMP(CURDATE() - INTERVAL 19 DAY, '10:00:00')),

    -- 4. Pedro (user=11) + Roberto (user=6) | R$ 200 (Sem seguro, Paciente 200) -> PAID (Consulta -15 dias)
    (4, NULL, '11', '6', 200.00, 0.00, 200.00, 'PAID',
     TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '11:50:00'),
     TIMESTAMP(CURDATE() + INTERVAL 15 DAY, '11:50:00'),
     TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '12:30:00'),
     TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '12:30:00'),
     NULL),

    -- 5. Ana (user=12) + Mariana (user=7) | R$ 170 (Unimed 80% cobre 136, Paciente 34) -> PAID (Consulta -10 dias)
    (5, NULL, '12', '7', 170.00, 136.00, 34.00, 'PAID',
     TIMESTAMP(CURDATE() - INTERVAL 10 DAY, '15:35:00'),
     TIMESTAMP(CURDATE() + INTERVAL 20 DAY, '15:35:00'),
     TIMESTAMP(CURDATE() - INTERVAL 9 DAY, '16:00:00'),
     TIMESTAMP(CURDATE() - INTERVAL 10 DAY, '16:00:00'),
     TIMESTAMP(CURDATE() - INTERVAL 9 DAY, '16:00:00')),

    -- 6. Lucas (user=13) + Paulo (user=8) | R$ 220 (Amil 50% cobre 110, Paciente 110) -> INSURANCE_PENDING (Consulta -5 dias)
    (6, NULL, '13', '8', 220.00, 110.00, 110.00, 'INSURANCE_PENDING',
     TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '10:35:00'),
     TIMESTAMP(CURDATE() + INTERVAL 25 DAY, '10:35:00'),
     NULL, NULL, NULL),

    -- 19. Marcos (user=15) + Demo (user=2) | R$ 150 (Sem seguro, 100% Paciente) -> PAID (Consulta -40 dias)
    (19, NULL, '15', '2', 150.00, 0.00, 150.00, 'PAID',
     TIMESTAMP(CURDATE() - INTERVAL 40 DAY, '10:35:00'),
     TIMESTAMP(CURDATE() - INTERVAL 10 DAY, '10:35:00'), -- Vencimento (30 dias)
     TIMESTAMP(CURDATE() - INTERVAL 40 DAY, '11:00:00'),
     TIMESTAMP(CURDATE() - INTERVAL 40 DAY, '11:00:00'),
     NULL),

    -- 20. Júlia (user=14) + Ana Paula (user=5) | R$ 180 (Sem seguro, 100% Paciente) -> PAID (Consulta -45 dias)
    (20, NULL, '14', '5', 180.00, 0.00, 180.00, 'PAID',
     TIMESTAMP(CURDATE() - INTERVAL 45 DAY, '10:35:00'),
     TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '10:35:00'),
     TIMESTAMP(CURDATE() - INTERVAL 45 DAY, '11:00:00'),
     TIMESTAMP(CURDATE() - INTERVAL 45 DAY, '11:00:00'),
     NULL),

    -- 21. Gabriel (user=17) + Carlos (user=4) | R$ 250 (Sem seguro, 100% Paciente) -> PENDING (Consulta -50 dias)
    (21, NULL, '17', '4', 250.00, 0.00, 250.00, 'PENDING',
     TIMESTAMP(CURDATE() - INTERVAL 50 DAY, '11:35:00'),
     TIMESTAMP(CURDATE() - INTERVAL 20 DAY, '11:35:00'),
     NULL, NULL, NULL),

     -- Consulta 22 (Fernanda, user_id=16) - Sem Seguro
     (22, NULL, '16', '7', 170.00, 0.00, 170.00, 'PAID',
     TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '14:35:00'),
     TIMESTAMP(CURDATE() + INTERVAL 18 DAY, '14:35:00'),
     TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '15:00:00'),
     TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '15:00:00'),
     NULL),
    -- Consulta 23 (Marcos, user_id=15) - Sem Seguro
    (23, NULL, '15', '7', 170.00, 0.00, 170.00, 'PAID',
    TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '16:50:00'),
    TIMESTAMP(CURDATE() + INTERVAL 2 DAY, '16:50:00'),
    TIMESTAMP(CURDATE() - INTERVAL 27 DAY, '09:00:00'),
    TIMESTAMP(CURDATE() - INTERVAL 27 DAY, '09:00:00'),
    NULL);