import type {
  Paginated,
  PlatformOverview,
  PlatformShop,
  PlatformShopFilters,
  PlatformShopStatus,
  PlatformSubscription,
  PlatformSubscriptionFilters,
  SubscriptionPlan
} from './types';

const CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Multan',
  'Faisalabad',
  'Quetta',
  'Hyderabad',
  'Timergara',
  'Sialkot',
  'Gujranwala',
  'Abbottabad',
  'Mardan',
  'Swat',
  'Bahawalpur'
] as const;

const SHOP_PREFIXES = [
  'Ali',
  'Zeb',
  'Khan',
  'City',
  'Royal',
  'Smart',
  'Mobile',
  'Phone',
  'Gadget',
  'Tech',
  'Prime',
  'Star',
  'New',
  'Al-Madina',
  'Pak',
  'Digital',
  'Express',
  'Metro',
  'Capital',
  'Frontier'
];

const SHOP_SUFFIXES = [
  'Mobiles',
  'Phone Hub',
  'Mobile Center',
  'Cell Zone',
  'Gadget Point',
  'Smart Store',
  'Mobile Mart',
  'Phone Palace',
  'Mobile World',
  'Tech Corner',
  'Communications',
  'Electronics',
  'Mobile Plaza',
  'Phone Point',
  'Cell City'
];

const FIRST_NAMES = [
  'Ali',
  'Hamid',
  'Anwar',
  'Usman',
  'Sana',
  'Bilal',
  'Nadeem',
  'Imran',
  'Kashif',
  'Farhan',
  'Ayesha',
  'Omar',
  'Hassan',
  'Fatima',
  'Zain',
  'Maryam',
  'Saad',
  'Rabia',
  'Tariq',
  'Nadia',
  'Junaid',
  'Hina',
  'Adnan',
  'Saima',
  'Waqas'
];

const LAST_NAMES = [
  'Raza',
  'Khan',
  'Zeb',
  'Siddiqui',
  'Malik',
  'Ahmed',
  'Baloch',
  'Butt',
  'Ali',
  'Qureshi',
  'Sheikh',
  'Hussain',
  'Rehman',
  'Awan',
  'Mirza',
  'Chaudhry',
  'Shah',
  'Abbasi',
  'Yousafzai',
  'Lodhi'
];

const STREETS = [
  'Hall Road',
  'Saddar Bazaar',
  'Main Bazaar',
  'MA Jinnah Road',
  'Blue Area',
  'Ghanta Ghar Chowk',
  'Jinnah Road',
  'D Ground',
  'Raja Bazaar',
  'Auto Bhan Road',
  'University Road',
  'GT Road',
  'Mall Road',
  'Committee Chowk',
  'Cantt Area',
  'Chowk Yadgar'
];

const STATUSES: PlatformShopStatus[] = [
  'ACTIVE',
  'ACTIVE',
  'ACTIVE',
  'ACTIVE',
  'ACTIVE',
  'TRIAL',
  'TRIAL',
  'EXPIRED',
  'ACTIVE',
  'TRIAL'
];

function pad(n: number): string {
  return String(n).padStart(3, '0');
}

function isoDaysFromNow(days: number): string {
  const d = new Date('2026-10-05T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(days: number): string {
  return isoDaysFromNow(-days);
}

function buildShops(count: number): PlatformShop[] {
  const shops: PlatformShop[] = [];

  for (let i = 1; i <= count; i++) {
    const city = CITIES[(i - 1) % CITIES.length] ?? 'Karachi';
    const prefix = SHOP_PREFIXES[(i - 1) % SHOP_PREFIXES.length] ?? 'Al-Madina';
    const suffix = SHOP_SUFFIXES[(i * 3) % SHOP_SUFFIXES.length] ?? 'Store';
    const first = FIRST_NAMES[(i - 1) % FIRST_NAMES.length] ?? 'Ali';
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length] ?? 'Khan';
    const street = STREETS[(i * 5) % STREETS.length] ?? 'Main Bazaar';
    const status = STATUSES[(i - 1) % STATUSES.length] ?? 'ACTIVE';
    const block = ((i * 3) % 24) + 1;
    const phoneTail = String(10000000 + i * 137).slice(-8);

    const trialEnds = status === 'TRIAL' ? isoDaysFromNow(7 + (i % 21)) : null;
    const nextDue =
      status === 'TRIAL'
        ? null
        : status === 'EXPIRED'
          ? isoDaysFromNow(-(10 + (i % 40)))
          : isoDaysFromNow(5 + (i % 45));

    shops.push({
      id: `shop_${pad(i)}`,
      name: `${prefix} ${suffix}${i > SHOP_PREFIXES.length ? ` ${i}` : ''}`,
      address: `${street}, Block ${block}`,
      city,
      owner_name: `${first} ${last}`,
      owner_phone: `03${phoneTail}`,
      status,
      trial_ends_at: trialEnds,
      next_due_at: nextDue,
      created_at: isoDaysAgo(30 + (i % 700))
    });
  }

  return shops;
}

const MONTHLY_AMOUNT_PAISA = 1000_00;
const YEARLY_AMOUNT_PAISA = 12000_00;

function buildSubscriptions(shops: PlatformShop[]): PlatformSubscription[] {
  return shops.map((shop, index) => {
    const plan: SubscriptionPlan =
      shop.status === 'TRIAL' ? 'TRIAL' : index % 4 === 0 ? 'YEARLY' : 'MONTHLY';

    return {
      id: `sub_${shop.id}`,
      shop_id: shop.id,
      shop_name: shop.name,
      plan,
      status: shop.status,
      next_due_at: shop.next_due_at ?? shop.trial_ends_at,
      amount_paisa:
        plan === 'TRIAL' ? 0 : plan === 'YEARLY' ? YEARLY_AMOUNT_PAISA : MONTHLY_AMOUNT_PAISA
    };
  });
}

const SHOPS: PlatformShop[] = buildShops(100);
const SUBSCRIPTIONS: PlatformSubscription[] = buildSubscriptions(SHOPS);

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total_items: items.length,
    page,
    limit
  };
}

function parseCsvFilter(value?: string | string[]): string[] {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

function filterShops(filters: PlatformShopFilters): PlatformShop[] {
  let rows = [...SHOPS];
  const q = filters.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.owner_name.toLowerCase().includes(q) ||
        s.owner_phone.includes(q) ||
        s.city.toLowerCase().includes(q)
    );
  }
  if (filters.city && filters.city !== 'all') {
    const cities = parseCsvFilter(filters.city);
    if (cities.length) {
      rows = rows.filter((s) => cities.includes(s.city));
    }
  }
  if (filters.status) {
    const statuses = parseCsvFilter(filters.status);
    if (statuses.length) {
      rows = rows.filter((s) => statuses.includes(s.status));
    }
  }
  return rows;
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  await delay();
  const count = (status: PlatformShopStatus) => SHOPS.filter((s) => s.status === status).length;
  const mrr = SUBSCRIPTIONS.filter((s) => s.status === 'ACTIVE' && s.plan !== 'TRIAL').reduce(
    (sum, s) => sum + (s.plan === 'YEARLY' ? Math.round(s.amount_paisa / 12) : s.amount_paisa),
    0
  );
  return {
    total_shops: SHOPS.length,
    active_shops: count('ACTIVE'),
    trial_shops: count('TRIAL'),
    expired_shops: count('EXPIRED'),
    mrr_paisa: mrr
  };
}

export async function listPlatformShops(
  filters: PlatformShopFilters = {}
): Promise<Paginated<PlatformShop>> {
  await delay();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  return paginate(filterShops(filters), page, limit);
}

export async function listPlatformSubscriptions(
  filters: PlatformSubscriptionFilters = {}
): Promise<Paginated<PlatformSubscription>> {
  await delay();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  let rows = [...SUBSCRIPTIONS];
  const q = filters.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((s) => s.shop_name.toLowerCase().includes(q));
  }
  if (filters.status) {
    const statuses = parseCsvFilter(filters.status);
    if (statuses.length) {
      rows = rows.filter((s) => statuses.includes(s.status));
    }
  }
  return paginate(rows, page, limit);
}

export async function listPlatformCities(): Promise<string[]> {
  await delay();
  return [...new Set(SHOPS.map((s) => s.city))].sort();
}
