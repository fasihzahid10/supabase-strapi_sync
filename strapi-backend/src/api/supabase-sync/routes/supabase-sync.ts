
export default {
  routes: [
    {
      method: 'POST',
      path: '/supabase-sync',
      handler: 'supabase-sync.sync',
      config: {
        auth: false,
      },
    },
  ],
};

