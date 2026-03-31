-- ============================================================
-- V4__seed_advanced_clinic.sql
-- Seeds avançados: População de Grupos de Pacientes e Efeitos Adversos
-- ============================================================

-- ============================================================
-- 1. RELATÓRIOS DE EFEITOS ADVERSOS (Adverse Effects)
-- Vinculados aos pacientes, médicos e prescrições já existentes (V2)
-- ============================================================

-- ============================================================
-- 1. RELATÓRIOS DE EFEITOS ADVERSOS (Adverse Effects)
-- ATENÇÃO: Esta tabela mapeia os IDs baseados na tb_users (USER_ID)
-- Dra. Mariana = 7, Dr. Carlos = 4, Dr. Roberto = 6, Dr. Paulo = 8
-- Fernanda = 16, Ana Costa = 12, João = 9, Pedro = 11, Lucas = 13
-- ============================================================

INSERT IGNORE INTO tb_adverse_effect_reports (patient_id, doctor_id, prescription_id, description, status, reported_at)
VALUES
    -- João (user 9) relatando tosse para Dr. Carlos (user 4) - Receita 2
    (9, 4, 2, 'Paciente relatou tosse seca persistente e irritativa, iniciada 5 dias após o início do uso contínuo da Losartana.', 'REPORTED', TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '08:00:00')),

    -- Pedro (user 11) relatando dor no estômago para Dr. Roberto (user 6) - Receita 4
    (11, 6, 4, 'Desconforto gástrico severo e sensação de queimação epigástrica (azia) após 3 dias de uso contínuo do Ibuprofeno para a dor no joelho.', 'REVIEWED', TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '14:30:00')),

    -- Lucas (user 13) relatando sonolência para Dr. Paulo (user 8) - Receita 6
    (13, 8, 6, 'Cansaço excessivo, letargia e leve bradicardia notada pelo paciente após ajuste na dose da profilaxia da enxaqueca.', 'REPORTED', TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '09:15:00')),

    -- Efeito do Roacutan: Fernanda (user 16) relatando para Dra. Mariana (user 7) - Receita 7
    (16, 7, 7, 'Dra, meus lábios estão rachando muito a ponto de sangrar levemente, e sinto os olhos muito secos. O que devo fazer?', 'REPORTED', TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '10:00:00')),

    -- Efeito da Desonida: Ana Costa (user 12) relatando para Dra. Mariana (user 7) - Receita 5
    (12, 7, 5, 'Senti muita ardência e vermelhidão logo após aplicar o creme Desonida no antebraço, parei o uso imediatamente.', 'REPORTED', TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '18:30:00'));

-- ============================================================
-- 2. NOVAS CONSULTAS E PRONTUÁRIOS (Patient Groups)
-- Consultas do passado geradas para disparar as keywords de Grupos
-- ============================================================

-- Consulta 19: Paciente 8 (Marcos) com Dr. Demo (1) -> Grupo: Diabéticos
INSERT IGNORE INTO tb_appointments (id, patient_id, doctor_id, appointment_date_time, duration, appointment_end_time, reason, status, notes, type, reminder_24h_sent, reminder_1h_sent, billing_processed, pharmacy_processed)
VALUES (19, 8, 1, TIMESTAMP(CURDATE() - INTERVAL 40 DAY, '09:00:00'), 30, TIMESTAMP(CURDATE() - INTERVAL 40 DAY, '09:30:00'), 'Poliúria, polidipsia e perda de peso recente', 'COMPLETED', NULL, 'IN_PERSON', TRUE, TRUE, TRUE, TRUE);

INSERT IGNORE INTO tb_appointment_records (appointment_id, chief_complaint, diagnosis_cid10, diagnosis_description, treatment_plan, created_at, updated_at)
VALUES (19, 'Muita sede e urina frequente (Noctúria)', 'E11', 'Diabetes mellitus não insulinodependente (Diabético)', 'Controle rigoroso da glicemia, dieta restrita em carboidratos simples e início de hipoglicemiante oral.', TIMESTAMP(CURDATE() - INTERVAL 40 DAY, '09:28:00'), TIMESTAMP(CURDATE() - INTERVAL 40 DAY, '09:28:00'));

-- Consulta 20: Paciente 7 (Júlia) com Dra. Ana Paula (3) -> Grupo: Respiratórios
INSERT IGNORE INTO tb_appointments (id, patient_id, doctor_id, appointment_date_time, duration, appointment_end_time, reason, status, notes, type, reminder_24h_sent, reminder_1h_sent, billing_processed, pharmacy_processed)
VALUES (20, 7, 3, TIMESTAMP(CURDATE() - INTERVAL 45 DAY, '10:00:00'), 30, TIMESTAMP(CURDATE() - INTERVAL 45 DAY, '10:30:00'), 'Falta de ar ao brincar/esforço', 'COMPLETED', NULL, 'IN_PERSON', TRUE, TRUE, TRUE, TRUE);

INSERT IGNORE INTO tb_appointment_records (appointment_id, chief_complaint, diagnosis_cid10, diagnosis_description, treatment_plan, created_at, updated_at)
VALUES (20, 'Falta de ar leve e chiado no peito durante a noite', 'J45', 'Asma brônquica alérgica (Respiratória)', 'Uso de broncodilatador SOS e corticoide inalatório preventivo.', TIMESTAMP(CURDATE() - INTERVAL 45 DAY, '10:28:00'), TIMESTAMP(CURDATE() - INTERVAL 45 DAY, '10:28:00'));

-- Consulta 21: Paciente 10 (Gabriel) com Dr. Carlos (2) -> Grupo: Cardiopatas
INSERT IGNORE INTO tb_appointments (id, patient_id, doctor_id, appointment_date_time, duration, appointment_end_time, reason, status, notes, type, reminder_24h_sent, reminder_1h_sent, billing_processed, pharmacy_processed)
VALUES (21, 10, 2, TIMESTAMP(CURDATE() - INTERVAL 50 DAY, '11:00:00'), 30, TIMESTAMP(CURDATE() - INTERVAL 50 DAY, '11:30:00'), 'Coração acelerado do nada e pontadas no peito', 'COMPLETED', NULL, 'IN_PERSON', TRUE, TRUE, TRUE, TRUE);

INSERT IGNORE INTO tb_appointment_records (appointment_id, chief_complaint, diagnosis_cid10, diagnosis_description, treatment_plan, created_at, updated_at)
VALUES (21, 'Palpitações súbitas (taquicardia)', 'I49', 'Arritmia cardíaca inespecífica a ser investigada', 'Evitar cafeína e energéticos. Solicitado Holter de 24 horas e teste ergométrico.', TIMESTAMP(CURDATE() - INTERVAL 50 DAY, '11:28:00'), TIMESTAMP(CURDATE() - INTERVAL 50 DAY, '11:28:00'));

-- Consulta 22: Paciente 9 (Fernanda) -> Tratamento de Acne Severa
INSERT IGNORE INTO tb_appointments (id, patient_id, doctor_id, appointment_date_time, duration, appointment_end_time, reason, status, notes, type, reminder_24h_sent, reminder_1h_sent, billing_processed, pharmacy_processed)
VALUES (22, 9, 5, TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '14:00:00'), 30, TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '14:30:00'), 'Acne nódulo-cística resistente a tratamentos tópicos', 'COMPLETED', 'Iniciado protocolo com Isotretinoína.', 'IN_PERSON', TRUE, TRUE, TRUE, TRUE);

-- Consulta 23: Paciente 8 (Marcos) -> Tratamento de Psoríase
INSERT IGNORE INTO tb_appointments (id, patient_id, doctor_id, appointment_date_time, duration, appointment_end_time, reason, status, notes, type, reminder_24h_sent, reminder_1h_sent, billing_processed, pharmacy_processed)
VALUES (23, 8, 5, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '16:00:00'), 45, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '16:45:00'), 'Manchas descamativas nos cotovelos e joelhos', 'COMPLETED', 'Psoríase em placas confirmada.', 'IN_PERSON', TRUE, TRUE, TRUE, TRUE);

INSERT IGNORE INTO tb_appointments (id, patient_id, doctor_id, appointment_date_time, duration, appointment_end_time, reason, status, notes, type, reminder_24h_sent, reminder_1h_sent, billing_processed, pharmacy_processed)
VALUES
    (24, 10, 5, TIMESTAMP(CURDATE() + INTERVAL 1 DAY, '14:00:00'), 30, TIMESTAMP(CURDATE() + INTERVAL 1 DAY, '14:30:00'), 'Mapeamento de pintas (Dermatoscopia)', 'SCHEDULED', NULL, 'IN_PERSON', FALSE, FALSE, FALSE, FALSE),
    (25, 3,  5, TIMESTAMP(CURDATE() + INTERVAL 3 DAY, '15:00:00'), 30, TIMESTAMP(CURDATE() + INTERVAL 3 DAY, '15:30:00'), 'Queda severa de cabelo (Alopecia)', 'SCHEDULED', NULL, 'ONLINE', FALSE, FALSE, FALSE, FALSE),
    (26, 11, 5, TIMESTAMP(CURDATE() + INTERVAL 1 DAY, '16:00:00'), 30, TIMESTAMP(CURDATE() + INTERVAL 1 DAY, '16:30:00'), 'Retorno tratamento de melasma', 'SCHEDULED', NULL, 'IN_PERSON', FALSE, FALSE, FALSE, FALSE);

-- URL do Jitsi para a consulta Online que está por vir
UPDATE tb_appointments SET meeting_url = 'https://meet.jit.si/hms-alopecia-consulta-5-3' WHERE id = 25;

-- --- PRONTUÁRIOS PARA AS CONSULTAS CONCLUÍDAS ---
INSERT IGNORE INTO tb_appointment_records (appointment_id, chief_complaint, history_of_present_illness, physical_exam_notes, symptoms, diagnosis_cid10, diagnosis_description, treatment_plan, requested_tests, notes, created_at, updated_at)
VALUES
    (22, 'Espinhas dolorosas no rosto e costas há 2 anos', 'Falha com tetraciclina prévia. Impacto psicológico.', 'Presença de nódulos e cistos em face, dorso e tórax.', 'Nódulos eritematosos, dor local', 'L70.0', 'Acne vulgar (nódulo-cística)', 'Isotretinoína 20mg/dia. Cuidados labiais rigorosos.', 'TGO, TGP, Colesterol Total, Frações, Triglicerídeos, Beta-HCG', 'Termo de consentimento assinado.', TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '14:25:00'), TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '14:25:00')),
    (23, 'Placas vermelhas que coçam e descamam', 'Apareceram há 6 meses, piora com estresse.', 'Placas eritemato-descamativas, sinal de Auspitz positivo.', 'Prurido, descamação, vermelhidão', 'L40.0', 'Psoríase vulgar', 'Clobetasol tópico e hidratante intensivo. Encaminhado p/ fototerapia.', NULL, 'Paciente orientado sobre cronificação.', TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '16:40:00'), TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '16:40:00'));

-- --- PRESCRIÇÕES E MEDICAMENTOS ---
INSERT IGNORE INTO tb_prescriptions (id, appointment_id, notes, created_at, status)
VALUES
    (7, 22, 'Uso contínuo rigoroso. Retornar com exames mensais.', TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '14:28:00'), 'DISPENSED'),
    (8, 23, 'Aplicar pomada apenas nas lesões ativas.', TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '16:42:00'), 'DISPENSED');

INSERT IGNORE INTO tb_medicines (name, dosage, frequency, duration, prescription_id)
VALUES
    ('Isotretinoína', '20mg', '1 cápsula ao dia após o almoço', 30, 7),
    ('Protetor Labial Reparador', 'QSP', 'Aplicar nos lábios a cada 2 horas', 30, 7),
    ('Clobetasol Propionato Pomada', '0,05%', 'Aplicar 1x ao dia nas placas vermelhas', 15, 8);

-- --- EXAMES SOLICITADOS (Exigência do Roacutan) ---
INSERT IGNORE INTO tb_lab_orders (id, order_number, appointment_id, patient_id, order_date, notes, status)
VALUES (4, 'LAB-2026-DERM01', 22, 9, TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '14:30:00'), 'Controle basal para início de Isotretinoína.', 'COMPLETED');

INSERT IGNORE INTO lab_test_items (test_name, category, clinical_indication, instructions, result_notes, status, lab_order_id)
VALUES
    ('Perfil Hepático (TGO/TGP)', 'Bioquímica', 'Controle Roacutan', 'Jejum 8h.', 'Função hepática preservada.', 'COMPLETED', 4),
    ('Beta-HCG Sanguíneo', 'Hormônios', 'Exclusão de gravidez', 'Nenhum preparo.', 'Negativo.', 'COMPLETED', 4);