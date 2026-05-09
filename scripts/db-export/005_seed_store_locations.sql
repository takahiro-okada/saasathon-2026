-- ShopMate - Seed Data: Store Locations (20 Christchurch stores)

INSERT INTO store_locations (id, brand, name, slug, address, lat, lng, foodstuffs_store_id) VALUES
-- Woolworths (7)
('ww-riccarton', 'woolworths', 'Woolworths Riccarton', 'riccarton', '129 Riccarton Rd, Riccarton', -43.531, 172.583, NULL),
('ww-moorhouse', 'woolworths', 'Woolworths Moorhouse Ave', 'moorhouse', 'Moorhouse Ave, Christchurch', -43.541, 172.638, NULL),
('ww-shirley', 'woolworths', 'Woolworths Shirley', 'shirley', 'The Palms, Shirley', -43.508, 172.653, NULL),
('ww-bush-inn', 'woolworths', 'Woolworths Bush Inn', 'bush-inn', 'Bush Inn Centre, Riccarton', -43.527, 172.569, NULL),
('ww-ferrymead', 'woolworths', 'Woolworths Ferrymead', 'ferrymead', 'Ferrymead, Christchurch', -43.558, 172.692, NULL),
('ww-hornby', 'woolworths', 'Woolworths Hornby', 'hornby', 'The Hub, Hornby', -43.548, 172.525, NULL),
('ww-barrington', 'woolworths', 'Woolworths Barrington', 'barrington', 'Barrington Mall, Christchurch', -43.555, 172.608, NULL),
-- PAK'nSAVE (6)
('pns-riccarton', 'paknsave', 'PAK''nSAVE Riccarton', 'riccarton', 'Riccarton Rd, Riccarton', -43.531, 172.5962, '4a279605-eaa8-470d-bcd4-0a9e3c9ab43b'),
('pns-moorhouse', 'paknsave', 'PAK''nSAVE Moorhouse', 'moorhouse', 'Moorhouse Ave, Christchurch', -43.5389, 172.6383, '61dd754e-8525-4b9e-9e08-173389eea8a8'),
('pns-wainoni', 'paknsave', 'PAK''nSAVE Wainoni', 'wainoni', 'Wainoni Rd, Wainoni', -43.5132, 172.694, 'dbca5e00-f7f9-43ae-91de-031ad16f8a92'),
('pns-rangiora', 'paknsave', 'PAK''nSAVE Rangiora', 'rangiora', 'High St, Rangiora', -43.3251, 172.599, '715f0e22-95e0-45ce-af3a-07057209976e'),
('pns-hornby', 'paknsave', 'PAK''nSAVE Hornby', 'hornby', 'Main South Rd, Hornby', -43.5425, 172.5228, 'be4c4780-218e-425a-a90f-63e21773572b'),
('pns-papanui', 'paknsave', 'PAK''nSAVE Papanui', 'papanui', 'Main North Rd, Papanui', -43.4854, 172.615, '8cd700ae-d96f-4761-bd7a-805d6b93536d'),
-- New World (7)
('nw-ilam', 'newworld', 'New World Ilam', 'ilam', 'Clyde Rd, Ilam', -43.524, 172.571, 'c6abac35-b75f-4a02-9b43-7ad5a7c7aa37'),
('nw-stanmore', 'newworld', 'New World Stanmore', 'stanmore', 'Stanmore Rd, Linwood', -43.522, 172.659, 'a0d86b5f-fdf4-44d1-b7a2-f418bdb37f4e'),
('nw-halswell', 'newworld', 'New World Halswell', 'halswell', 'Halswell Rd, Halswell', -43.576, 172.562, '95d161ea-9a31-4fca-acbe-96f271d627df'),
('nw-bishopdale', 'newworld', 'New World Bishopdale', 'bishopdale', 'Bishopdale, Christchurch', -43.496, 172.597, 'b3158cd8-72b9-40e5-8c4e-abd43c1be305'),
('nw-ferry-road', 'newworld', 'New World Ferry Road', 'ferry-road', 'Ferry Rd, Woolston', -43.545, 172.668, 'fc91d59f-6ab5-4447-8737-125e09e8e50e'),
('nw-wigram', 'newworld', 'New World Wigram', 'wigram', '51 Skyhawk Rd, Wigram', -43.5526, 172.5578, '3ee7214b-6df4-4fdb-9dd6-3b2fc252ba6b'),
('nw-prestons', 'newworld', 'New World Prestons', 'prestons', 'Prestons, Christchurch', -43.495, 172.634, '5b8f8e3b-e1a0-4a11-b16b-9cfe782c124e')
ON CONFLICT (id) DO NOTHING;
