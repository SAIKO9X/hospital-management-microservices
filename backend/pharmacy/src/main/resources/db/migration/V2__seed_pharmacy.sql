-- ============================================================
-- V2__seed_pharmacy.sql
-- Seed consolidado do pharmacy-service
-- Inclui medicamentos, estoque, read-model de pacientes,
-- prescrições processadas e vendas com datas dinâmicas (últimos 30 dias).
-- ============================================================

-- ============================================================
-- 1. CATÁLOGO DE MEDICAMENTOS (Com estoque já reduzido das vendas)
-- ============================================================
INSERT IGNORE INTO tb_medicines (name, dosage, category, type, manufacturer, unit_price, total_stock)
VALUES
    ('Paracetamol',           '500mg',  'ANALGESIC',    'TABLET',  'Genérico',        2.50,  70),  -- Vendidos: 30
    ('Amoxicilina',           '500mg',  'ANTIBIOTIC',   'CAPSULE', 'EMS',             8.90,  39),  -- Vendidos: 21
    ('Ibuprofeno',            '400mg',  'ANALGESIC',    'TABLET',  'Genérico',        3.20,  70),  -- Vendidos: 10
    ('Omeprazol',             '20mg',   'OTHER',        'CAPSULE', 'Medley',          5.00,  20),  -- Vendidos: 30
    ('Losartana',             '50mg',   'OTHER',        'TABLET',  'Genérico',        1.80,  90),  -- Vendidos: 30
    ('Atorvastatina',         '20mg',   'OTHER',        'TABLET',  'Pfizer',         12.00,  30),  -- Vendidos: 30
    ('Metformina',            '850mg',  'OTHER',        'TABLET',  'Merck',           4.50,  80),  -- Vendidos: 10
    ('Fluconazol',            '150mg',  'OTHER',        'CAPSULE', 'Medley',         18.50,  39),  -- Vendidos: 1
    ('Azitromicina',          '500mg',  'ANTIBIOTIC',   'TABLET',  'EMS',            14.80,  50),  -- Vendidos: 0
    ('Dipirona Sódica',       '500mg',  'ANALGESIC',    'TABLET',  'Genérico',        1.50, 140),  -- Vendidos: 10
    ('Ácido Acetilsalicílico','100mg',  'OTHER',        'TABLET',  'Bayer',           0.90, 200),  -- Vendidos: 0
    ('Metoprolol Succinato',  '50mg',   'OTHER',        'TABLET',  'AstraZeneca',     8.20,  70),  -- Vendidos: 0
    ('Lisinopril',            '10mg',   'OTHER',        'TABLET',  'Genérico',        2.90,  80);  -- Vendidos: 0

-- ============================================================
-- 2. LOTES DE ESTOQUE
-- ============================================================
INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-PARA-001', 70, 100, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Paracetamol';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-AMOX-001', 39,  60, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Amoxicilina';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-IBUP-001', 70,  80, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Ibuprofeno';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-OMEP-001', 20,  50, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Omeprazol';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-LOSA-001', 90, 120, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Losartana';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-ATOR-001', 30,  60, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Atorvastatina';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-METF-001', 80,  90, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Metformina';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-FLUC-001', 39,  40, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Fluconazol';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-AZIT-001', 50,  50, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Azitromicina';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-DIPI-001', 140, 150, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Dipirona Sódica';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-AAS-001',  200, 200, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Ácido Acetilsalicílico';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-METO-001',  70,  70, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Metoprolol Succinato';

INSERT IGNORE INTO tb_medicine_inventory (medicine_id, batch_no, quantity, initial_quantity, status, expiry_date, added_date)
SELECT id, 'LOTE-LISI-001',  80,  80, 'ACTIVE', CURDATE() + INTERVAL 365 DAY, CURDATE() - INTERVAL 60 DAY FROM tb_medicines WHERE name = 'Lisinopril';

-- ============================================================
-- 3. READ MODEL DE PACIENTES
-- ============================================================
INSERT IGNORE INTO patient_read_model (user_id, name, email, phone_number, cpf)
VALUES
    (3,  'Patient Demo',             'patient@hms.com',           '(11) 99999-0001', '000.000.000-00'),
    (9,  'João Victor Silva',        'joao.silva@email.com',      '(11) 98765-4001', '123.456.789-01'),
    (10, 'Maria Fernanda Santos',    'maria.santos@email.com',    '(11) 98765-4002', '234.567.890-12'),
    (11, 'Pedro Henrique Oliveira',  'pedro.oliveira@email.com',  '(11) 98765-4003', '345.678.901-23'),
    (12, 'Ana Beatriz Costa',        'ana.costa@email.com',       '(11) 98765-4004', '456.789.012-34'),
    (13, 'Lucas Gabriel Ferreira',   'lucas.ferreira@email.com',  '(11) 98765-4005', '567.890.123-45'),
    (14, 'Júlia Rodrigues Alves',    'julia.alves@email.com',     '(11) 98765-4006', '678.901.234-56'),
    (15, 'Marcos Vinícius Souza',    'marcos.souza@email.com',    '(11) 98765-4007', '789.012.345-67'),
    (16, 'Fernanda Cristina Lima',   'fernanda.lima@email.com',   '(11) 98765-4008', '890.123.456-78'),
    (17, 'Gabriel Augusto Rocha',    'gabriel.rocha@email.com',   '(11) 98765-4009', '901.234.567-89'),
    (18, 'Beatriz Caroline Mendes',  'beatriz.mendes@email.com',  '(11) 98765-4010', '012.345.678-90');

-- ============================================================
-- 4. PRESCRIÇÕES (MENSAGERIA) - Datas nos últimos 30 dias
-- ============================================================
INSERT IGNORE INTO tb_prescription_copy
    (prescription_id, appointment_id, patient_id, doctor_id, valid_until, notes, items_json, processed, received_at)
VALUES
    (
        1, 1, 1, 1, CURDATE() + INTERVAL 30 DAY,
        'Prescrição de rotina. Retorno em 30 dias com resultados dos exames.',
        '[{"name":"Paracetamol","dosage":"500mg","frequency":"1 comprimido a cada 8h se dor/febre","duration":7},{"name":"Omeprazol","dosage":"20mg","frequency":"1 cápsula em jejum pela manhã","duration":30}]',
        TRUE, TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '11:00:00')
    ),
    (
        2, 2, 2, 2, CURDATE() + INTERVAL 30 DAY,
        'Tratamento para hipertensão arterial estágio 1. Monitorar PA semanalmente.',
        '[{"name":"Losartana Potássica","dosage":"50mg","frequency":"1 comprimido ao dia, preferencialmente pela manhã","duration":30},{"name":"Atorvastatina","dosage":"20mg","frequency":"1 comprimido à noite","duration":30}]',
        TRUE, TIMESTAMP(CURDATE() - INTERVAL 20 DAY, '15:00:00')
    ),
    (
        3, 3, 3, 3, CURDATE() + INTERVAL 30 DAY,
        'Tratamento de infecção viral com antibioticoterapia empírica e antitérmico.',
        '[{"name":"Amoxicilina","dosage":"500mg","frequency":"1 cápsula a cada 8 horas","duration":7},{"name":"Paracetamol Pediátrico","dosage":"200mg/mL (solução)","frequency":"Dose: 0,4 mL/kg a cada 6 horas se febre acima de 37,8°C","duration":5}]',
        TRUE, TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '09:30:00')
    );

-- ============================================================
-- 5. VENDAS DE BALCÃO (Aumentadas para o gráfico)
-- ============================================================
INSERT IGNORE INTO tb_pharmacy_sales
    (id, original_prescription_id, appointment_id, patient_id, buyer_name, buyer_contact, sale_date, total_amount)
VALUES
    -- Vendas atreladas à receita
    (1, 1,    1,    3,  'Patient Demo',            '(11) 99999-0001', TIMESTAMP(CURDATE() - INTERVAL 28 DAY, '11:30:00'), 200.00),
    (2, 2,    2,    9,  'João Victor Silva',       '(11) 98765-4001', TIMESTAMP(CURDATE() - INTERVAL 20 DAY, '16:00:00'), 414.00),
    (3, 3,    3,    10, 'Maria Fernanda Santos',   '(11) 98765-4002', TIMESTAMP(CURDATE() - INTERVAL 15 DAY, '11:00:00'), 211.90),

    -- Vendas diretas extras para popular o gráfico
    (4, NULL, NULL, 11, 'Pedro Henrique Oliveira', '(11) 98765-4003', TIMESTAMP(CURDATE() - INTERVAL 10 DAY, '10:15:00'), 32.00),
    (5, NULL, NULL, 12, 'Ana Beatriz Costa',       '(11) 98765-4004', TIMESTAMP(CURDATE() - INTERVAL 7 DAY,  '14:20:00'), 45.00),
    (6, NULL, NULL, 13, 'Lucas Gabriel Ferreira',  '(11) 98765-4005', TIMESTAMP(CURDATE() - INTERVAL 3 DAY,  '09:10:00'), 18.50),
    (7, NULL, NULL, 14, 'Júlia Rodrigues Alves',   '(11) 98765-4006', TIMESTAMP(CURDATE() - INTERVAL 1 DAY,  '18:45:00'), 15.00);

-- ============================================================
-- 6. ITENS DAS VENDAS
-- ============================================================
-- Venda 1
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 1, id, 'Paracetamol', 'LOTE-PARA-001', 20, 2.50, 50.00 FROM tb_medicines WHERE name = 'Paracetamol';
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 1, id, 'Omeprazol', 'LOTE-OMEP-001', 30, 5.00, 150.00 FROM tb_medicines WHERE name = 'Omeprazol';

-- Venda 2
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 2, id, 'Losartana Potássica', 'LOTE-LOSA-001', 30, 1.80, 54.00 FROM tb_medicines WHERE name = 'Losartana';
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 2, id, 'Atorvastatina', 'LOTE-ATOR-001', 30, 12.00, 360.00 FROM tb_medicines WHERE name = 'Atorvastatina';

-- Venda 3
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 3, id, 'Amoxicilina', 'LOTE-AMOX-001', 21, 8.90, 186.90 FROM tb_medicines WHERE name = 'Amoxicilina';
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 3, id, 'Paracetamol', 'LOTE-PARA-001', 10, 2.50, 25.00 FROM tb_medicines WHERE name = 'Paracetamol';

-- Venda 4 (Extra)
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 4, id, 'Ibuprofeno', 'LOTE-IBUP-001', 10, 3.20, 32.00 FROM tb_medicines WHERE name = 'Ibuprofeno';

-- Venda 5 (Extra)
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 5, id, 'Metformina', 'LOTE-METF-001', 10, 4.50, 45.00 FROM tb_medicines WHERE name = 'Metformina';

-- Venda 6 (Extra)
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 6, id, 'Fluconazol', 'LOTE-FLUC-001', 1, 18.50, 18.50 FROM tb_medicines WHERE name = 'Fluconazol';

-- Venda 7 (Extra)
INSERT IGNORE INTO tb_pharmacy_sale_items (sale_id, medicine_id, medicine_name, batch_no, quantity, unit_price, total_price)
SELECT 7, id, 'Dipirona Sódica', 'LOTE-DIPI-001', 10, 1.50, 15.00 FROM tb_medicines WHERE name = 'Dipirona Sódica';