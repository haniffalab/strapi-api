module.exports = {
    'ebi-ols': {
        enabled: true,
        resolve: './src/plugins/ebi-ols',
        config: {
            apiVersion: '2022-07', // Or one of Shopify's supported API versions
            accessToken: process.env.SHOPIFY_ACCESS_TOKEN, // The environment variable containing your private app's access token
            shopName: process.env.SHOP_NAME, // The environment variable containing your myshopify.com domain
        },
    }
}