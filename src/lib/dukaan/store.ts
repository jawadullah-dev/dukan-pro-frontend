import type { DukaanStore, PaymentMethod } from './types';
import { formatPurchaseNo, formatSaleNo, newId, nowIso, todayIsoDate } from './numbers';

const SHOP_ID = 'shop_khalid';
const OWNER_ID = 'user_khalid';
const CAT_PHONES = 'cat_phones';
const CAT_CHARGERS = 'cat_chargers';
const CAT_COVERS = 'cat_covers';
const BRAND_SAMSUNG = 'brand_samsung';
const BRAND_ANKER = 'brand_anker';
const BRAND_GENERIC = 'brand_generic';
const PROD_A15 = 'prod_a15';
const PROD_CHARGER = 'prod_charger';
const PROD_COVER = 'prod_cover';
const SUP_WALKIN = 'sup_walkin';
const SUP_ABC = 'sup_abc';
const CUST_ALI = 'cust_ali';
const PURCHASE_1 = 'pur_001';
const SALE_1 = 'sale_001';
const SALE_2 = 'sale_002';

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function seedStore(): DukaanStore {
  const created = nowIso();
  const today = todayIsoDate();

  const store: DukaanStore = {
    shops: [
      {
        id: SHOP_ID,
        name: 'Zeb Mobile Center',
        phone: '03459871234',
        address: 'Main Bazaar, Timergara, Lower Dir, KPK',
        status: 'ACTIVE',
        subscription_ends_at: '2027-12-31',
        next_sale_no: 3,
        next_purchase_no: 2,
        created_at: created
      }
    ],
    users: [
      {
        id: OWNER_ID,
        shop_id: SHOP_ID,
        name: 'Anwar Zeb',
        phone: '03459871234',
        password_hash: 'demo123',
        role: 'OWNER',
        status: 'ACTIVE',
        created_at: created
      }
    ],
    categories: [
      { id: CAT_PHONES, shop_id: SHOP_ID, name: 'Mobile Phones', is_active: true },
      { id: CAT_CHARGERS, shop_id: SHOP_ID, name: 'Chargers', is_active: true },
      { id: CAT_COVERS, shop_id: SHOP_ID, name: 'Covers / Cases', is_active: true }
    ],
    brands: [
      { id: BRAND_SAMSUNG, shop_id: SHOP_ID, name: 'Samsung', is_active: true },
      { id: BRAND_ANKER, shop_id: SHOP_ID, name: 'Anker', is_active: true },
      { id: BRAND_GENERIC, shop_id: SHOP_ID, name: 'Local / Generic', is_active: true }
    ],
    products: [
      {
        id: PROD_A15,
        shop_id: SHOP_ID,
        category_id: CAT_PHONES,
        brand_id: BRAND_SAMSUNG,
        name: 'Samsung Galaxy A15',
        model: 'A15',
        color: 'Black',
        ram: '6GB',
        storage: '128GB',
        tracking_type: 'SERIALIZED',
        default_purchase_price: 9000000,
        default_selling_price: 10000000,
        low_stock_threshold: 2,
        is_active: true,
        created_at: created
      },
      {
        id: PROD_CHARGER,
        shop_id: SHOP_ID,
        category_id: CAT_CHARGERS,
        brand_id: BRAND_ANKER,
        name: 'Anker 25W Fast Charger',
        tracking_type: 'QUANTITY',
        default_purchase_price: 50000,
        default_selling_price: 80000,
        low_stock_threshold: 10,
        is_active: true,
        created_at: created
      },
      {
        id: PROD_COVER,
        shop_id: SHOP_ID,
        category_id: CAT_COVERS,
        brand_id: BRAND_GENERIC,
        name: 'Silicone Cover A15',
        tracking_type: 'QUANTITY',
        default_purchase_price: 20000,
        default_selling_price: 50000,
        low_stock_threshold: 5,
        is_active: true,
        created_at: created
      }
    ],
    stock_levels: [
      {
        id: 'sl_charger',
        shop_id: SHOP_ID,
        product_id: PROD_CHARGER,
        quantity_on_hand: 38,
        avg_unit_cost: 50000
      },
      {
        id: 'sl_cover',
        shop_id: SHOP_ID,
        product_id: PROD_COVER,
        quantity_on_hand: 20,
        avg_unit_cost: 20000
      }
    ],
    suppliers: [
      {
        id: SUP_WALKIN,
        shop_id: SHOP_ID,
        name: 'Walk-in seller',
        phone: '-',
        notes: 'System supplier for used phones',
        opening_balance: 0,
        is_system: true,
        is_active: true,
        created_at: created
      },
      {
        id: SUP_ABC,
        shop_id: SHOP_ID,
        name: 'Peshawar Mobile Market',
        phone: '03115554433',
        address: 'Board Bazaar, Peshawar',
        opening_balance: 5000000,
        is_system: false,
        is_active: true,
        created_at: created
      }
    ],
    customers: [
      {
        id: CUST_ALI,
        shop_id: SHOP_ID,
        name: 'Rahman Ullah',
        phone: '03461234567',
        address: 'Balambat, Lower Dir',
        opening_balance: 0,
        is_active: true,
        created_at: created
      }
    ],
    purchases: [
      {
        id: PURCHASE_1,
        shop_id: SHOP_ID,
        supplier_id: SUP_ABC,
        purchase_no: formatPurchaseNo(1),
        supplier_invoice_ref: 'AB-771',
        purchase_date: today,
        total_amount: 29000000,
        status: 'ACTIVE',
        is_opening_stock: false,
        client_request_id: 'seed_pur_1',
        created_at: created
      }
    ],
    purchase_items: [
      {
        id: 'pi_1',
        shop_id: SHOP_ID,
        purchase_id: PURCHASE_1,
        product_id: PROD_A15,
        quantity: 3,
        unit_cost: 9000000,
        total_cost: 27000000
      },
      {
        id: 'pi_2',
        shop_id: SHOP_ID,
        purchase_id: PURCHASE_1,
        product_id: PROD_CHARGER,
        quantity: 40,
        unit_cost: 50000,
        total_cost: 2000000
      }
    ],
    inventory_units: [
      {
        id: 'iu_111',
        shop_id: SHOP_ID,
        product_id: PROD_A15,
        purchase_item_id: 'pi_1',
        imei1: '111111111111111',
        condition: 'NEW',
        unit_cost: 9000000,
        status: 'SOLD',
        created_at: created
      },
      {
        id: 'iu_222',
        shop_id: SHOP_ID,
        product_id: PROD_A15,
        purchase_item_id: 'pi_1',
        imei1: '222222222222222',
        condition: 'NEW',
        unit_cost: 9000000,
        status: 'IN_STOCK',
        created_at: created
      },
      {
        id: 'iu_333',
        shop_id: SHOP_ID,
        product_id: PROD_A15,
        purchase_item_id: 'pi_1',
        imei1: '333333333333333',
        condition: 'NEW',
        unit_cost: 9000000,
        status: 'IN_STOCK',
        created_at: created
      }
    ],
    inventory_movements: [
      {
        id: newId('im'),
        shop_id: SHOP_ID,
        product_id: PROD_A15,
        inventory_unit_id: 'iu_111',
        type: 'PURCHASE',
        quantity_change: 1,
        reference_type: 'purchase',
        reference_id: PURCHASE_1,
        created_at: created
      },
      {
        id: newId('im'),
        shop_id: SHOP_ID,
        product_id: PROD_A15,
        inventory_unit_id: 'iu_222',
        type: 'PURCHASE',
        quantity_change: 1,
        reference_type: 'purchase',
        reference_id: PURCHASE_1,
        created_at: created
      },
      {
        id: newId('im'),
        shop_id: SHOP_ID,
        product_id: PROD_A15,
        inventory_unit_id: 'iu_333',
        type: 'PURCHASE',
        quantity_change: 1,
        reference_type: 'purchase',
        reference_id: PURCHASE_1,
        created_at: created
      },
      {
        id: newId('im'),
        shop_id: SHOP_ID,
        product_id: PROD_CHARGER,
        type: 'PURCHASE',
        quantity_change: 40,
        reference_type: 'purchase',
        reference_id: PURCHASE_1,
        created_at: created
      },
      {
        id: newId('im'),
        shop_id: SHOP_ID,
        product_id: PROD_CHARGER,
        type: 'SALE',
        quantity_change: -2,
        reference_type: 'sale',
        reference_id: SALE_1,
        created_at: created
      },
      {
        id: newId('im'),
        shop_id: SHOP_ID,
        product_id: PROD_A15,
        inventory_unit_id: 'iu_111',
        type: 'SALE',
        quantity_change: -1,
        reference_type: 'sale',
        reference_id: SALE_2,
        created_at: created
      }
    ],
    supplier_payments: [
      {
        id: 'sp_1',
        shop_id: SHOP_ID,
        supplier_id: SUP_ABC,
        purchase_id: PURCHASE_1,
        amount: 10000000,
        payment_date: today,
        notes: 'Partial payment',
        status: 'ACTIVE',
        client_request_id: 'seed_sp_1',
        created_at: created
      }
    ],
    sales: [
      {
        id: SALE_1,
        shop_id: SHOP_ID,
        sale_no: formatSaleNo(1),
        sale_date: today,
        subtotal: 210000,
        discount: 10000,
        total_amount: 200000,
        status: 'ACTIVE',
        client_request_id: 'seed_sale_1',
        created_at: created
      },
      {
        id: SALE_2,
        shop_id: SHOP_ID,
        customer_id: CUST_ALI,
        sale_no: formatSaleNo(2),
        sale_date: today,
        subtotal: 10000000,
        discount: 0,
        total_amount: 10000000,
        due_date: today,
        status: 'ACTIVE',
        client_request_id: 'seed_sale_2',
        created_at: created
      }
    ],
    sale_items: [
      {
        id: 'si_1',
        shop_id: SHOP_ID,
        sale_id: SALE_1,
        product_id: PROD_CHARGER,
        quantity: 2,
        unit_price: 80000,
        unit_cost: 50000,
        total: 160000
      },
      {
        id: 'si_2',
        shop_id: SHOP_ID,
        sale_id: SALE_1,
        product_id: PROD_COVER,
        quantity: 1,
        unit_price: 50000,
        unit_cost: 20000,
        total: 50000
      },
      {
        id: 'si_3',
        shop_id: SHOP_ID,
        sale_id: SALE_2,
        product_id: PROD_A15,
        inventory_unit_id: 'iu_111',
        quantity: 1,
        unit_price: 10000000,
        unit_cost: 9000000,
        total: 10000000
      }
    ],
    payments: [
      {
        id: 'pay_1',
        shop_id: SHOP_ID,
        customer_id: CUST_ALI,
        sale_id: SALE_2,
        amount: 5000000,
        method: 'CASH',
        receipt_group_id: 'rg_1',
        status: 'ACTIVE',
        client_request_id: 'seed_pay_1',
        created_at: created
      }
    ],
    expense_categories: [
      { id: 'ec_rent', shop_id: SHOP_ID, name: 'Dukan kiraya', is_active: true },
      { id: 'ec_elec', shop_id: SHOP_ID, name: 'Bijli bill', is_active: true },
      { id: 'ec_internet', shop_id: SHOP_ID, name: 'Internet / WiFi', is_active: true },
      { id: 'ec_sal', shop_id: SHOP_ID, name: 'Naukar tankhwah', is_active: true },
      { id: 'ec_transport', shop_id: SHOP_ID, name: 'Peshawar market trip', is_active: true },
      { id: 'ec_maint', shop_id: SHOP_ID, name: 'Shop maintenance', is_active: true },
      { id: 'ec_marketing', shop_id: SHOP_ID, name: 'Flex / sticker / ads', is_active: true },
      { id: 'ec_other', shop_id: SHOP_ID, name: 'Chai pani / other', is_active: true }
    ],
    expenses: [
      {
        id: 'exp_1',
        shop_id: SHOP_ID,
        category_id: 'ec_elec',
        amount: 500000,
        expense_date: today,
        description: 'WAPDA monthly bill — Timergara shop',
        status: 'ACTIVE',
        created_at: created
      }
    ],
    cash_movements: [
      {
        id: 'cm_open',
        shop_id: SHOP_ID,
        type: 'OPENING_CASH',
        direction: 'IN',
        amount: 50000000,
        is_overdraft: false,
        note: 'Opening cash — Timergara dukaan',
        created_at: created
      },
      {
        id: 'cm_sp1',
        shop_id: SHOP_ID,
        type: 'SUPPLIER_PAYMENT',
        direction: 'OUT',
        amount: 10000000,
        is_overdraft: false,
        reference_type: 'supplier_payment',
        reference_id: 'sp_1',
        created_at: created
      },
      {
        id: 'cm_sale1',
        shop_id: SHOP_ID,
        type: 'CUSTOMER_PAYMENT',
        direction: 'IN',
        amount: 200000,
        is_overdraft: false,
        reference_type: 'sale',
        reference_id: SALE_1,
        created_at: created
      },
      {
        id: 'cm_pay1',
        shop_id: SHOP_ID,
        type: 'CUSTOMER_PAYMENT',
        direction: 'IN',
        amount: 5000000,
        is_overdraft: false,
        reference_type: 'payment',
        reference_id: 'pay_1',
        created_at: created
      },
      {
        id: 'cm_exp1',
        shop_id: SHOP_ID,
        type: 'EXPENSE',
        direction: 'OUT',
        amount: 500000,
        is_overdraft: false,
        reference_type: 'expense',
        reference_id: 'exp_1',
        created_at: created
      }
    ],
    request_index: {
      seed_pur_1: { type: 'purchase', id: PURCHASE_1 },
      seed_sp_1: { type: 'supplier_payment', id: 'sp_1' },
      seed_sale_1: { type: 'sale', id: SALE_1 },
      seed_sale_2: { type: 'sale', id: SALE_2 },
      seed_pay_1: { type: 'payment', id: 'pay_1' }
    }
  };

  const coverSl = store.stock_levels.find((s) => s.product_id === PROD_COVER);
  if (coverSl) coverSl.quantity_on_hand = 19;

  padListDemoData(store, created, today);
  return store;
}

function padListDemoData(store: DukaanStore, created: string, today: string): void {
  const TARGET = 100;
  const pick = <T>(arr: readonly T[], n: number): T => (arr[n % arr.length] ?? arr[0]) as T;
  const pkPhone = (n: number, prefix: string) =>
    `${prefix}${String(10000000 + ((n * 137) % 90000000)).slice(0, 7)}`;

  const CATEGORY_NAMES = [
    'Mobile Phones',
    'Chargers',
    'Covers / Cases',
    'Earphones / Handsfree',
    'Power Banks',
    'USB Cables',
    'Screen Protectors',
    'Memory Cards',
    'Used Phones',
    'Feature Phones',
    'Bluetooth Speakers',
    'Smart Watches',
    'Phone Batteries',
    'Data Cables Type-C',
    'Car Chargers',
    'OTG / Converters',
    'Selfie Sticks',
    'Repair Tools',
    'SIM / Jazz Load',
    'Gift Packs'
  ] as const;

  const BRAND_NAMES = [
    'Samsung',
    'Xiaomi',
    'Redmi',
    'Infinix',
    'Tecno',
    'Itel',
    'Oppo',
    'Vivo',
    'Realme',
    'Nokia',
    'Sparx',
    'Honor',
    'Anker',
    'Baseus',
    'Remax',
    'Awei',
    'Qmobile',
    'Voice',
    'Local / Generic',
    'Oraimo'
  ] as const;

  const PHONE_MODELS = [
    ['Samsung Galaxy A06', 'A06', '4GB', '64GB', 28000, 32000],
    ['Samsung Galaxy A15', 'A15', '6GB', '128GB', 42000, 48000],
    ['Samsung Galaxy A25', 'A25', '8GB', '256GB', 62000, 70000],
    ['Redmi 13C', '13C', '6GB', '128GB', 26000, 30000],
    ['Redmi Note 13', 'Note 13', '8GB', '256GB', 48000, 55000],
    ['Infinix Hot 40', 'Hot 40', '8GB', '256GB', 35000, 40000],
    ['Infinix Smart 8', 'Smart 8', '4GB', '128GB', 22000, 25500],
    ['Tecno Spark 20', 'Spark 20', '8GB', '256GB', 30000, 34500],
    ['Tecno Camon 20', 'Camon 20', '8GB', '256GB', 42000, 48000],
    ['Itel A70', 'A70', '4GB', '128GB', 18000, 21000],
    ['Oppo A18', 'A18', '4GB', '64GB', 32000, 36500],
    ['Vivo Y17s', 'Y17s', '4GB', '128GB', 34000, 38500],
    ['Realme C53', 'C53', '6GB', '128GB', 29000, 33500],
    ['Nokia 105', '105', '-', '-', 4500, 5500],
    ['Sparx Neo 7', 'Neo 7', '4GB', '64GB', 16000, 18500]
  ] as const;

  const ACCESSORY_NAMES = [
    ['Type-C Fast Charger 25W', 450, 800],
    ['Micro USB Charger', 250, 450],
    ['Silicone Soft Cover', 150, 400],
    ['Hard Back Cover', 200, 500],
    ['Tempered Glass 9H', 120, 350],
    ['Handsfree Wired', 180, 400],
    ['Bluetooth Earpods', 900, 1500],
    ['Power Bank 10000mAh', 1800, 2800],
    ['Power Bank 20000mAh', 2800, 4200],
    ['USB Data Cable 1m', 100, 250],
    ['Type-C Cable Braided', 200, 450],
    ['Car Charger Dual Port', 350, 700],
    ['Memory Card 64GB', 800, 1200],
    ['Memory Card 128GB', 1400, 2000],
    ['OTG Adapter', 80, 200],
    ['Phone Stand Desktop', 250, 500],
    ['Ring Holder Grip', 100, 250],
    ['Wireless Mouse cheap', 600, 1000],
    ['Neckband Bluetooth', 1200, 2000],
    ['Speaker Mini Portable', 1500, 2500]
  ] as const;

  const PATHAN_NAMES = [
    'Zafar Khan',
    'Rahman Ullah',
    'Gulzar Ahmad',
    'Bakhtiar Khan',
    'Ihsanullah',
    'Sajid Khan',
    'Fazal Rabi',
    'Shamsher Ali',
    'Nisar Ahmad',
    'Adnan Khan',
    'Waheed Ullah',
    'Ikram Khan',
    'Murad Ali',
    'Sabz Ali',
    'Hikmatullah',
    'Javed Khan',
    'Amjad Ali',
    'Farooq Shah',
    'Israr Ahmad',
    'Shahid Khan',
    'Latif Ur Rahman',
    'Qismat Khan',
    'Anwar Zeb',
    'Riaz Khan',
    'Asadullah',
    'Naeemullah',
    'Samiullah',
    'Habib Ur Rahman',
    'Noor Ullah',
    'Zahir Shah',
    'Imran Khan Dir',
    'Umar Hayat',
    'Sultan Zeb',
    'Munsif Khan',
    'Tariq Aziz',
    'Kamran Khan',
    'Wajid Ali',
    'Fawad Khan',
    'Irfanullah',
    'Sardar Ali',
    'Yousaf Khan',
    'Hameedullah',
    'Abid Khan',
    'Nasir Ahmad',
    'Gul Nawaz',
    'Sher Zaman',
    'Jehangir Khan',
    'Roohullah',
    'Attaullah',
    'Mujahid Khan'
  ] as const;

  const AREAS = [
    'Timergara Main Bazaar',
    'Balambat',
    'Lal Qila',
    'Mayar',
    'Khall',
    'Ouch',
    'Samar Bagh',
    'Munda',
    'Adenzai',
    'Chakdara',
    'Talash',
    'Gulabad',
    'Asbanr',
    'Kambat',
    'Rabat'
  ] as const;

  const SUPPLIER_NAMES = [
    'Peshawar Mobile Market',
    'Board Bazaar Wholesale',
    'Saddar Mobile Hub Peshawar',
    'China Market Dealer',
    'Lahore Mobile City Agent',
    'Timergara Wholesale Corner',
    'Dir Traders Supply',
    'Khan Electronics Wholesale',
    'Star Mobile Distributors',
    'Fast Charge Importers',
    'Gulbahar Accessories',
    'Hayatabad Mobile Link',
    'University Road Mobiles',
    'Used Phone Collector Dir',
    'Jazz Franchise Stockist'
  ] as const;

  const SUPPLIER_CITIES = [
    'Board Bazaar, Peshawar',
    'Saddar, Peshawar',
    'China Market, Peshawar',
    'Main Bazaar, Timergara',
    'GT Road, Lahore',
    'University Road, Peshawar',
    'Hayatabad, Peshawar',
    'Chakdara Bazaar'
  ] as const;

  const EXPENSE_CAT_NAMES = [
    'Dukan kiraya',
    'Bijli bill',
    'Internet / WiFi',
    'Naukar tankhwah',
    'Peshawar market trip',
    'Shop maintenance',
    'Flex / sticker / ads',
    'Chai pani / other',
    'Generator petrol',
    'Shop cleaner',
    'Security / chowkidar',
    'Packing material',
    'Bank charges',
    'Mobile load for shop',
    'Guest hospitality'
  ] as const;

  const EXPENSE_NOTES = [
    'Monthly kiraya Timergara shop',
    'WAPDA bijli bill',
    'PTCL / StormFiber bill',
    'Helper salary — Gulzar',
    'Peshawar Board Bazaar purchase trip',
    'Paint / shelf repair',
    'New flex board Main Bazaar',
    'Chai for customers',
    'Generator petrol for load-shedding',
    'Shop cleaning weekly',
    'Rikshaw fare to Chakdara',
    'Carton / bubble wrap stock',
    'Jazz / Telenor shop load',
    'Guest meal — supplier visit',
    'Misc shop expense'
  ] as const;

  const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BANK', 'MOBILE_WALLET'];

  while (store.categories.length < TARGET) {
    const n = store.categories.length + 1;
    const base = pick(CATEGORY_NAMES, n);
    store.categories.push({
      id: `cat_demo_${n}`,
      shop_id: SHOP_ID,
      name: n <= CATEGORY_NAMES.length ? base : `${base} ${Math.ceil(n / CATEGORY_NAMES.length)}`,
      is_active: n % 7 !== 0
    });
  }

  while (store.expense_categories.length < TARGET) {
    const n = store.expense_categories.length + 1;
    const base = pick(EXPENSE_CAT_NAMES, n);
    store.expense_categories.push({
      id: `ec_demo_${n}`,
      shop_id: SHOP_ID,
      name:
        n <= EXPENSE_CAT_NAMES.length ? base : `${base} ${Math.ceil(n / EXPENSE_CAT_NAMES.length)}`,
      is_active: n % 8 !== 0
    });
  }

  while (store.brands.length < TARGET) {
    const n = store.brands.length + 1;
    const base = pick(BRAND_NAMES, n);
    store.brands.push({
      id: `brand_demo_${n}`,
      shop_id: SHOP_ID,
      name: n <= BRAND_NAMES.length ? base : `${base} Line ${Math.ceil(n / BRAND_NAMES.length)}`,
      is_active: n % 9 !== 0
    });
  }

  while (store.products.length < TARGET) {
    const n = store.products.length + 1;
    const id = `prod_demo_${n}`;
    const isSerialized = n % 5 === 0;
    if (isSerialized) {
      const [name, model, ram, storage, buyRs, sellRs] = pick(PHONE_MODELS, n);
      store.products.push({
        id,
        shop_id: SHOP_ID,
        category_id: CAT_PHONES,
        brand_id: store.brands[n % Math.min(12, store.brands.length)]?.id ?? 'b1',
        name: n > PHONE_MODELS.length ? `${name} #${n}` : name,
        model,
        color: pick(['Black', 'Blue', 'Gold', 'Green', 'Silver'] as const, n),
        ram,
        storage,
        tracking_type: 'SERIALIZED',
        default_purchase_price: buyRs * 100,
        default_selling_price: sellRs * 100,
        low_stock_threshold: 2,
        is_active: n % 11 !== 0,
        created_at: created
      });
    } else {
      const [name, buyRs, sellRs] = pick(ACCESSORY_NAMES, n);
      store.products.push({
        id,
        shop_id: SHOP_ID,
        category_id: store.categories[(n % 6) + 1]?.id ?? CAT_CHARGERS,
        brand_id: store.brands[n % store.brands.length]?.id ?? 'b1',
        name: n > ACCESSORY_NAMES.length ? `${name} pack ${n}` : name,
        tracking_type: 'QUANTITY',
        default_purchase_price: buyRs * 100,
        default_selling_price: sellRs * 100,
        low_stock_threshold: 10,
        is_active: n % 11 !== 0,
        created_at: created
      });
      store.stock_levels.push({
        id: `sl_demo_${n}`,
        shop_id: SHOP_ID,
        product_id: id,
        quantity_on_hand: 5 + (n % 40),
        avg_unit_cost: buyRs * 100
      });
    }
  }

  while (store.suppliers.length < TARGET) {
    const n = store.suppliers.length + 1;
    const base = pick(SUPPLIER_NAMES, n);
    store.suppliers.push({
      id: `sup_demo_${n}`,
      shop_id: SHOP_ID,
      name: n <= SUPPLIER_NAMES.length ? base : `${base} ${Math.ceil(n / SUPPLIER_NAMES.length)}`,
      phone: pkPhone(n, '0301'),
      address: pick(SUPPLIER_CITIES, n),
      opening_balance: n % 4 === 0 ? (5000 + n * 100) * 100 : 0,
      notes: n % 5 === 0 ? 'Udhar account — weekly clearance' : undefined,
      is_system: false,
      is_active: n % 13 !== 0,
      created_at: created
    });
  }

  while (store.customers.length < TARGET) {
    const n = store.customers.length + 1;
    const base = pick(PATHAN_NAMES, n);
    store.customers.push({
      id: `cust_demo_${n}`,
      shop_id: SHOP_ID,
      name: n <= PATHAN_NAMES.length ? base : `${base} (${Math.ceil(n / PATHAN_NAMES.length)})`,
      phone: pkPhone(n, '0345'),
      address: pick(AREAS, n),
      opening_balance: n % 6 === 0 ? (1000 + n * 50) * 100 : 0,
      notes: n % 8 === 0 ? 'Regular customer — Main Bazaar' : undefined,
      is_active: true,
      created_at: created
    });
  }

  while (store.purchases.length < TARGET) {
    const n = store.purchases.length + 1;
    const id = `pur_demo_${n}`;
    const date = n % 15 === 0 ? today : daysAgoIso(n % 90);
    store.purchases.push({
      id,
      shop_id: SHOP_ID,
      supplier_id: store.suppliers[n % store.suppliers.length]?.id ?? 'sup-1',
      purchase_no: formatPurchaseNo(n),
      supplier_invoice_ref: `DIR-${1000 + n}`,
      purchase_date: date,
      total_amount: (15000 + n * 850) * 100,
      status: n % 17 === 0 ? 'CANCELLED' : 'ACTIVE',
      is_opening_stock: n % 25 === 0,
      client_request_id: `seed_pur_demo_${n}`,
      created_at: created
    });
    store.request_index[`seed_pur_demo_${n}`] = { type: 'purchase', id };
  }

  while (store.sales.length < TARGET) {
    const n = store.sales.length + 1;
    const id = `sale_demo_${n}`;
    const total = (800 + n * 220) * 100;
    const date = daysAgoIso(n % 60);
    store.sales.push({
      id,
      shop_id: SHOP_ID,
      customer_id: n % 3 === 0 ? store.customers[n % store.customers.length]?.id : undefined,
      sale_no: formatSaleNo(n),
      sale_date: date,
      subtotal: total,
      discount: n % 7 === 0 ? 50000 : 0,
      total_amount: n % 7 === 0 ? total - 50000 : total,
      status: n % 19 === 0 ? 'CANCELLED' : 'ACTIVE',
      client_request_id: `seed_sale_demo_${n}`,
      created_at: created
    });
    store.request_index[`seed_sale_demo_${n}`] = { type: 'sale', id };
  }

  while (store.expenses.length < TARGET) {
    const n = store.expenses.length + 1;
    const cats = store.expense_categories;
    store.expenses.push({
      id: `exp_demo_${n}`,
      shop_id: SHOP_ID,
      category_id: cats[n % cats.length]?.id ?? 'cat-1',
      amount: (500 + n * 55) * 100,
      expense_date: daysAgoIso(n % 45),
      description: pick(EXPENSE_NOTES, n),
      status: n % 21 === 0 ? 'CANCELLED' : 'ACTIVE',
      created_at: created
    });
  }

  while (store.supplier_payments.length < TARGET) {
    const n = store.supplier_payments.length + 1;
    const id = `sp_demo_${n}`;
    store.supplier_payments.push({
      id,
      shop_id: SHOP_ID,
      supplier_id: store.suppliers[n % store.suppliers.length]?.id ?? 'sup-1',
      amount: (2000 + n * 120) * 100,
      payment_date: daysAgoIso(n % 40),
      notes: n % 4 === 0 ? 'Partial udhar clearance' : 'Cash paid at shop',
      status: n % 23 === 0 ? 'CANCELLED' : 'ACTIVE',
      client_request_id: `seed_sp_demo_${n}`,
      created_at: created
    });
    store.request_index[`seed_sp_demo_${n}`] = { type: 'supplier_payment', id };
  }

  while (store.payments.length < TARGET) {
    const n = store.payments.length + 1;
    const id = `pay_demo_${n}`;
    const cust = store.customers[n % store.customers.length];
    if (!cust) continue;
    const sale = store.sales[n % store.sales.length];
    if (!sale) continue;
    store.payments.push({
      id,
      shop_id: SHOP_ID,
      customer_id: cust.id,
      sale_id: n % 4 === 0 ? sale.id : undefined,
      amount: (500 + n * 90) * 100,
      method: pick(PAYMENT_METHODS, n),
      receipt_group_id: `rg_demo_${n}`,
      status: n % 21 === 0 ? 'CANCELLED' : 'ACTIVE',
      client_request_id: `seed_pay_demo_${n}`,
      created_at: `${daysAgoIso(n % 50)}T10:${String(n % 60).padStart(2, '0')}:00.000Z`
    });
    store.request_index[`seed_pay_demo_${n}`] = { type: 'payment', id };
  }

  while (store.cash_movements.length < TARGET) {
    const n = store.cash_movements.length + 1;
    const isIn = n % 2 === 0;
    store.cash_movements.push({
      id: `cm_demo_${n}`,
      shop_id: SHOP_ID,
      type: isIn
        ? 'CUSTOMER_PAYMENT'
        : pick(['EXPENSE', 'SUPPLIER_PAYMENT', 'OWNER_WITHDRAWAL'] as const, n),
      direction: isIn ? 'IN' : 'OUT',
      amount: (300 + n * 55) * 100,
      is_overdraft: false,
      note: isIn
        ? `Cash in — ${pick(PATHAN_NAMES, n)}`
        : pick(
            [
              'Supplier cash paid',
              'Bijli / expense cash',
              'Owner withdrew for home',
              'Peshawar trip cash'
            ] as const,
            n
          ),
      created_at: `${daysAgoIso(n % 55)}T12:${String(n % 60).padStart(2, '0')}:00.000Z`
    });
  }

  while (store.inventory_movements.length < TARGET) {
    const n = store.inventory_movements.length + 1;
    const product = store.products[n % store.products.length];
    if (!product) continue;
    const isIn = n % 3 !== 0;
    store.inventory_movements.push({
      id: `im_demo_${n}`,
      shop_id: SHOP_ID,
      product_id: product.id,
      type: isIn ? 'PURCHASE' : pick(['SALE', 'ADJUSTMENT', 'DAMAGED'] as const, n),
      quantity_change: isIn ? 1 + (n % 5) : -(1 + (n % 3)),
      reason: isIn
        ? undefined
        : pick(['Sold at counter', 'Stock count adjust', 'Screen damage write-off'] as const, n),
      reference_type: isIn ? 'purchase' : 'sale',
      reference_id: isIn
        ? (store.purchases[n % store.purchases.length]?.id ?? '')
        : (store.sales[n % store.sales.length]?.id ?? ''),
      created_at: `${daysAgoIso(n % 70)}T09:${String(n % 60).padStart(2, '0')}:00.000Z`
    });
  }

  const shop = store.shops[0];
  if (!shop) return;
  shop.next_purchase_no = store.purchases.length + 1;
  shop.next_sale_no = store.sales.length + 1;
}

const SEED_VERSION = 5;

const globalForDukaan = globalThis as typeof globalThis & {
  __dukaanStore?: DukaanStore;
  __dukaanSeedVersion?: number;
};

export function getStore(): DukaanStore {
  if (!globalForDukaan.__dukaanStore || globalForDukaan.__dukaanSeedVersion !== SEED_VERSION) {
    globalForDukaan.__dukaanStore = seedStore();
    globalForDukaan.__dukaanSeedVersion = SEED_VERSION;
  }
  return globalForDukaan.__dukaanStore;
}

export function cloneStore(store: DukaanStore): DukaanStore {
  return structuredClone(store);
}

export function replaceStore(next: DukaanStore): void {
  globalForDukaan.__dukaanStore = next;
}

export function runTransaction<T>(fn: (store: DukaanStore) => T): T {
  const snapshot = cloneStore(getStore());
  try {
    return fn(getStore());
  } catch (error) {
    replaceStore(snapshot);
    throw error;
  }
}

export { SHOP_ID, OWNER_ID, SUP_WALKIN, CUST_ALI, PROD_A15, PROD_CHARGER, PROD_COVER };
