const fs = require('fs');
const path = require('path');

const messagesDir = path.resolve(__dirname, '..', 'messages');

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else if (!(key in target)) {
      target[key] = source[key];
    }
  }
}

const enNewKeys = {
  errors: {
    backToLogin: 'Back to login'
  },
  rootError: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    tryAgain: 'Try again'
  },
  sr: {
    pagination: 'Pagination',
    previousPage: 'Go to previous page',
    nextPage: 'Go to next page',
    toggleSidebar: 'Toggle Sidebar',
    more: 'More',
    showInformation: 'Show information',
    uploadFiles: 'Upload files',
    quickFilters: 'Quick filters',
    removeFile: 'Remove file'
  },
  primitives: {
    commandTitle: 'Command Palette',
    commandDescription: 'Search for a command to run...',
    clearFilter: 'Clear {title} filter',
    labelHexValue: '{label} hex value',
    pagination: 'Pagination',
    previous: 'Previous',
    next: 'Next',
    ariaLabelPrev: 'Go to previous page',
    ariaLabelNext: 'Go to next page'
  },
  fileUploader: {
    singleFileLimit: 'Cannot upload more than 1 file at a time',
    multiFileLimit: 'Cannot upload more than {max} files',
    uploadedTarget: '{target} uploaded',
    uploadingTarget: 'Uploading {target}...',
    failedTarget: 'Failed to upload {target}',
    uploadUpTo: 'You can upload up to {max} {filesUnit}'
  },
  demoFormZod: {
    urlInvalid: 'Invalid URL',
    emailAlreadyRegistered: 'This email is already registered'
  },
  advancedFormZod: {
    confirmPassword: 'Please confirm your password',
    roleRequired: 'Role is required',
    addAtLeastOneMember: 'Add at least one member',
    selectCountry: 'Select a country',
    selectState: 'Select a state'
  },
  sheetFormZod: {
    priceMin: 'Price must be greater than 0',
    createdSuccess: 'Product created successfully!'
  },
  multiStepForm: {
    categoryRequired: 'Please select a category',
    createdSuccess: 'Product created successfully!',
    stepOf: 'Step {current} of {total}'
  },
  authDemo: {
    phonePlaceholder: '03XXXXXXXXX',
    passwordPlaceholder: '••••••••',
    passwordValue: 'Password: {password}'
  },
  schemaZod: {
    imageRequired: 'Image is required.',
    maxFileSize5Mb: 'Max file size is 5MB.',
    acceptedFileTypes: '.jpg, .jpeg, .png and .webp files are accepted.',
    productNameMin2: 'Product name must be at least 2 characters.',
    categoryRequired: 'Please select a category',
    priceRequired: 'Price is required',
    descriptionMin10: 'Description must be at least 10 characters.',
    firstNameMin2: 'First name must be at least 2 characters',
    lastNameMin2: 'Last name must be at least 2 characters',
    validEmail: 'Please enter a valid email',
    phoneRequired: 'Phone number is required',
    roleRequired: 'Please select a role',
    statusRequired: 'Please select a status'
  },
  reactQueryDemo: {
    pickPokemon: 'Pick a Pokemon',
    pickPokemonDesc: 'Each selection triggers useSuspenseQuery — cached results are instant, new fetches show the Suspense fallback.',
    heightWeight: 'Height: {height}m · Weight: {weight}kg'
  },
  iconsPage: {
    browseTabler: 'Tabler Icons'
  },
  recentSales: {
    avatarAlt: 'Avatar'
  },
  appearancePreview: {
    iphone15: 'iPhone 15'
  },
  steps: {
    stepOf: 'Step {current} of {total}'
  }
};

const urNewKeys = {
  errors: {
    backToLogin: 'لاگ ان پر واپس جائیں'
  },
  rootError: {
    title: 'کچھ غلط ہو گیا',
    description: 'ایک غیر متوقع غلطی پیش آئی۔ براہ کرم دوبارہ کوشش کریں۔',
    tryAgain: 'دوبارہ کوشش کریں'
  },
  sr: {
    pagination: 'پیجینیشن',
    previousPage: 'پچھلے صفحے پر جائیں',
    nextPage: 'اگلے صفحے پر جائیں',
    toggleSidebar: 'سائیڈبار تبدیل کریں',
    more: 'مزید',
    showInformation: 'معلومات دکھائیں',
    uploadFiles: 'فائلیں اپ لوڈ کریں',
    quickFilters: 'فوری فلٹرز',
    removeFile: 'فائل ہٹائیں'
  },
  primitives: {
    commandTitle: 'کمانڈ پیلیٹ',
    commandDescription: 'چلانے کے لیے کمانڈ تلاش کریں...',
    clearFilter: '{title} فلٹر صاف کریں',
    labelHexValue: '{label} ہیکس ویلیو',
    pagination: 'پیجینیشن',
    previous: 'پچھلا',
    next: 'اگلا',
    ariaLabelPrev: 'پچھلے صفحے پر جائیں',
    ariaLabelNext: 'اگلے صفحے پر جائیں'
  },
  fileUploader: {
    singleFileLimit: 'ایک وقت میں 1 سے زیادہ فائل اپ لوڈ نہیں کی جا سکتی',
    multiFileLimit: '{max} سے زیادہ فائلیں اپ لوڈ نہیں کی جا سکتیں',
    uploadedTarget: '{target} اپ لوڈ ہو گیا',
    uploadingTarget: '{target} اپ لوڈ ہو رہا ہے...',
    failedTarget: '{target} اپ لوڈ کرنے میں ناکامی',
    uploadUpTo: 'آپ زیادہ سے زیادہ {max} {filesUnit} اپ لوڈ کر سکتے ہیں'
  },
  demoFormZod: {
    urlInvalid: 'غلط URL',
    emailAlreadyRegistered: 'یہ ای میل پہلے سے رجسٹرڈ ہے'
  },
  advancedFormZod: {
    confirmPassword: 'براہ کرم اپنے پاس ورڈ کی تصدیق کریں',
    roleRequired: 'کردار درکار ہے',
    addAtLeastOneMember: 'کم از کم ایک رکن شامل کریں',
    selectCountry: 'ملک منتخب کریں',
    selectState: 'صوبہ منتخب کریں'
  },
  sheetFormZod: {
    priceMin: 'قیمت صفر سے زیادہ ہونی چاہیے',
    createdSuccess: 'پروڈکٹ کامیابی سے بنا دیا گیا!'
  },
  multiStepForm: {
    categoryRequired: 'براہ کرم زمرہ منتخب کریں',
    createdSuccess: 'پروڈکٹ کامیابی سے بنا دیا گیا!',
    stepOf: 'مرحلہ {current} از {total}'
  },
  authDemo: {
    phonePlaceholder: '03XXXXXXXXX',
    passwordPlaceholder: '••••••••',
    passwordValue: 'پاس ورڈ: {password}'
  },
  schemaZod: {
    imageRequired: 'تصویر درکار ہے۔',
    maxFileSize5Mb: 'زیادہ سے زیادہ فائل سائز 5MB ہے۔',
    acceptedFileTypes: '.jpg, .jpeg, .png اور .webp فائلیں قبول ہیں۔',
    productNameMin2: 'پروڈکٹ کا نام کم از کم 2 حروف کا ہونا چاہیے۔',
    categoryRequired: 'براہ کرم زمرہ منتخب کریں',
    priceRequired: 'قیمت درکار ہے',
    descriptionMin10: 'تفصیل کم از کم 10 حروف کی ہونی چاہیے۔',
    firstNameMin2: 'پہلا نام کم از کم 2 حروف کا ہونا چاہیے',
    lastNameMin2: 'آخری نام کم از کم 2 حروف کا ہونا چاہیے',
    validEmail: 'براہ کرم درست ای میل درج کریں',
    phoneRequired: 'فون نمبر درکار ہے',
    roleRequired: 'براہ کرم کردار منتخب کریں',
    statusRequired: 'براہ کرم سٹیٹس منتخب کریں'
  },
  reactQueryDemo: {
    pickPokemon: 'ایک پوکیمون منتخب کریں',
    pickPokemonDesc: 'ہر منتخب کردہ useSuspenseQuery کو متحرک کرتا ہے — کیش شدہ نتائج فوری ہوتے ہیں، نئے فیچز سسپنس فال بیک دکھاتے ہیں۔',
    heightWeight: 'اونچائی: {height}m · وزن: {weight}kg'
  },
  iconsPage: {
    browseTabler: 'ٹیبلر آئیکنز'
  },
  recentSales: {
    avatarAlt: 'اوٹار'
  },
  appearancePreview: {
    iphone15: 'آئی فون 15'
  },
  steps: {
    stepOf: 'مرحلہ {current} از {total}'
  }
};

const psNewKeys = {
  errors: {
    backToLogin: 'ننوتلو ته ستنېدل'
  },
  rootError: {
    title: 'یوه ستونزه رامنځته شوه',
    description: 'یوه ناڅاپه ستونزه رامنځته شوه. مهرباني وکړئ بیا هڅه وکړئ.',
    tryAgain: 'بیا هڅه وکړئ'
  },
  sr: {
    pagination: 'صفحو بېشېدنه',
    previousPage: 'شاته مخې ته لاړ شئ',
    nextPage: 'راتلونکی مخې ته لاړ شئ',
    toggleSidebar: 'سايډبار واړوئ',
    more: 'نور',
    showInformation: 'معلومات وښایاست',
    uploadFiles: 'فایلونه اپ لوډ کړئ',
    quickFilters: 'چټک فلټرونه',
    removeFile: 'فایل لرې کړئ'
  },
  primitives: {
    commandTitle: 'کمانډ پیلیټ',
    commandDescription: 'د چلولو لپاره کمانډ ولټوئ...',
    clearFilter: 'د {title} چاڼ پاک کړئ',
    labelHexValue: '{label} هیکس ارزښت',
    pagination: 'صفحو بېشېدنه',
    previous: 'شاته',
    next: 'مخکې',
    ariaLabelPrev: 'شاته مخې ته لاړ شئ',
    ariaLabelNext: 'راتلونکی مخې ته لاړ شئ'
  },
  fileUploader: {
    singleFileLimit: 'په یوه وخت کې له یو څخه زیات فایل اپ لوډ نشو کولی',
    multiFileLimit: '{max} څخه زیات فایلونه اپ لوډ نشو کولی',
    uploadedTarget: '{target} اپ لوډ شو',
    uploadingTarget: '{target} اپ لوډ کیږي...',
    failedTarget: 'د {target} اپ لوډ کول ناکام شو',
    uploadUpTo: 'تاسو تر {max} پورې {filesUnit} اپ لوډ کولی شئ'
  },
  demoFormZod: {
    urlInvalid: 'غلط URL',
    emailAlreadyRegistered: 'دا برېښنالیک دمخه ثبت شوی دی'
  },
  advancedFormZod: {
    confirmPassword: 'مهرباني وکړئ خپل پټنوم تایید کړئ',
    roleRequired: 'رول / دنده اړینه ده',
    addAtLeastOneMember: 'لږ تر لږه یو غړی زیات کړئ',
    selectCountry: 'هېواد وټاکئ',
    selectState: 'ولایت وټاکئ'
  },
  sheetFormZod: {
    priceMin: 'بیه باید له صفر څخه لوړه وي',
    createdSuccess: 'محصول په بریالیتوب سره جوړ شو!'
  },
  multiStepForm: {
    categoryRequired: 'مهرباني وکړئ کټګوري وټاکئ',
    createdSuccess: 'محصول په بریالیتوب سره جوړ شو!',
    stepOf: 'ګام {current} له {total}'
  },
  authDemo: {
    phonePlaceholder: '03XXXXXXXXX',
    passwordPlaceholder: '••••••••',
    passwordValue: 'پټنوم: {password}'
  },
  schemaZod: {
    imageRequired: 'انځور اړین دی.',
    maxFileSize5Mb: 'د فایل اعظمي اندازه ۵MB ده.',
    acceptedFileTypes: '.jpg, .jpeg, .png او .webp فایلونه منل کیږي.',
    productNameMin2: 'د محصول نوم باید لږ تر لږه دوه توری ولري.',
    categoryRequired: 'مهرباني وکړئ کټګوري وټاکئ',
    priceRequired: 'بیه اړینه ده',
    descriptionMin10: 'تفصیل باید لږ تر لږه لس توری ولري.',
    firstNameMin2: 'لومړی نوم باید لږ تر لږه دوه توری ولري',
    lastNameMin2: 'وروستی نوم باید لږ تر لږه دوه توری ولري',
    validEmail: 'مهرباني وکړئ سم برېښنالیک ولیکئ',
    phoneRequired: 'د تلیفون شمېره اړینه ده',
    roleRequired: 'مهرباني وکړئ رول وټاکئ',
    statusRequired: 'مهرباني وکړئ حالت وټاکئ'
  },
  reactQueryDemo: {
    pickPokemon: 'یو پوکیمون وټاکئ',
    pickPokemonDesc: 'هره انتخاب useSuspenseQuery چلوي — کیش شوي پایلې سمدستي دي، نوي غوښتنې سسپنس فال بیک ښیي.',
    heightWeight: 'لوړوالی: {height}m · وزن: {weight}kg'
  },
  iconsPage: {
    browseTabler: 'ټیبلر آیکونونه'
  },
  recentSales: {
    avatarAlt: 'اوټار'
  },
  appearancePreview: {
    iphone15: 'آئی فون ۱۵'
  },
  steps: {
    stepOf: 'ګام {current} له {total}'
  }
};

const fileMap = {
  'en.json': enNewKeys,
  'ur.json': urNewKeys,
  'ps.json': psNewKeys
};

let allOk = true;

for (const [filename, newKeys] of Object.entries(fileMap)) {
  const filePath = path.join(messagesDir, filename);
  console.log(`Processing ${filename}...`);

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const originalKeys = JSON.stringify(parsed);

    deepMerge(parsed, newKeys);

    const output = JSON.stringify(parsed, null, 2) + '\n';
    fs.writeFileSync(filePath, output, 'utf8');

    const verifyRaw = fs.readFileSync(filePath, 'utf8');
    JSON.parse(verifyRaw);
    console.log(`  ✓ ${filename} written and valid JSON`);

    const addedCount = Object.keys(JSON.stringify(newKeys)).length > 0 ? 'updated' : 'no changes';
    console.log(`  Status: ${addedCount}`);
  } catch (err) {
    console.error(`  ✗ ERROR in ${filename}: ${err.message}`);
    allOk = false;
  }
}

if (allOk) {
  console.log('\nAll files processed successfully.');
  process.exit(0);
} else {
  console.error('\nSome files had errors.');
  process.exit(1);
}
