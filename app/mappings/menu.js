module.exports = {
    msw: {
        mappings: {
            menu: {
                dynamic: 'strict',
                dynamic_date_formats: [],
                properties: {
                    name: {
                        type: 'text',
                        fields: {
                            raw: {
                                type: 'keyword',
                            },
                        },
                    },
                    part: {
                        type: 'keyword',
                    },
                    elements: {
                        type: 'nested',
                        properties: {
                            name: {
                                type: 'keyword',
                            },
                            icon: {
                                type: 'keyword',
                            },
                            page: {
                                type: 'keyword',
                            },
                            query: {
                                type: 'keyword',
                            },
                            submenus: {
                                type: 'nested',
                                properties: {
                                    name: {
                                        type: 'keyword',
                                    },
                                    icon: {
                                        type: 'keyword',
                                    },
                                    page: {
                                        type: 'keyword',
                                    },
                                    query: {
                                        type: 'keyword',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
