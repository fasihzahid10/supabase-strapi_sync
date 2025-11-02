<script lang="ts">
  export let data;
  const entries = data.entries ?? [];
</script>

<svelte:head>
  <title>Entries | Admin</title>
</svelte:head>

<div class="page">
  <header class="topbar">
    <div>
      <h1>Entries</h1>
      <p class="subtitle">Data coming from Strapi (synced with Supabase)</p>
    </div>
    <div class="badge">
      {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
    </div>
  </header>

  {#if entries.length === 0}
    <div class="empty">
      <h2>No entries yet</h2>
      <p>Go to Strapi → Content → Entry and publish one.</p>
    </div>
  {:else}
    <section class="grid">
      {#each entries as entry}
        <article class="card">
          <h2>{entry.title || 'Untitled'}</h2>
          <p class="desc">{entry.description || '— no description —'}</p>
          {#if entry.timestamp}
            <p class="time">
              {new Date(entry.timestamp).toLocaleString()}
            </p>
          {/if}
        </article>
      {/each}
    </section>
  {/if}
</div>

<style>
  .page {
    max-width: 1080px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #f6f7fb;
    min-height: 100vh;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
    margin-bottom: 1.75rem;
  }

  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
  }

  .subtitle {
    color: #6c7280;
    margin-top: 0.3rem;
    font-size: 0.9rem;
  }

  .badge {
    background: #e9f3ff;
    color: #1356b8;
    padding: 0.4rem 1.1rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .empty {
    background: white;
    border: 1px dashed #d3d7df;
    border-radius: 1rem;
    padding: 3rem 2rem;
    text-align: center;
  }

  .empty h2 {
    margin-bottom: 0.5rem;
  }

  .grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .card {
    background: white;
    border-radius: 1.1rem;
    padding: 1.1rem 1.1rem 1rem;
    border: 1px solid rgba(15, 23, 42, 0.04);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .card h2 {
    font-size: 1.02rem;
    margin: 0;
  }

  .desc {
    color: #5b6270;
    font-size: 0.88rem;
    line-height: 1.4;
    flex: 1;
  }

  .time {
    margin-top: auto;
    font-size: 0.68rem;
    color: #99a1ae;
  }

  @media (max-width: 600px) {
    .topbar {
      flex-direction: column;
      align-items: flex-start;
    }
    .page {
      padding-inline: 1rem;
    }
  }
</style>
