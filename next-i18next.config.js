module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    localeDetection: true,
    fallbackLng: 'en',
    localePath: './public/locales',
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
