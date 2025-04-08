module.exports = {
    expo: {
        name: 'Caelum',
        slug: 'caelum-react-native',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './logo.jpeg',
        userInterfaceStyle: 'automatic',
        splash: {
            image: './logo.jpeg',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
        },
        assetBundlePatterns: [
            '**/*'
        ],
        ios: {
            supportsTablet: true,
            "bundleIdentifier": "com.oriolgds.caelum"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './logo.jpeg',
                backgroundColor: '#ffffff'
            },
            package: 'com.oriolgds.caelum',
            permissions: [
                'ACCESS_COARSE_LOCATION',
                'ACCESS_FINE_LOCATION'
            ]
        },
        web: {
            favicon: './logo.jpeg'
        },
        extra: {
            weatherApiKey: '3f6c339889485d99f645d7545d79e52f',
            eas: {
                projectId: '6e00353c-fa7a-4ba5-8255-a4480e1f4c81'
            }
        }
    }
}; 