<script lang="ts">
  import TFAInput from "../../lib/2faInput.svelte";
  import QRCode from "qrcode";

  let img: string;

  const request2FA = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/2fa`, {
      credentials: "include",
    });

    if (res.ok) {
      const { otpauthURL } = await res.json();

      QRCode.toDataURL(otpauthURL, function (err, data_url) {
        console.error(err);
        img = data_url;
      });
    }
    //todo: do case where user is not authenticated
  };
</script>

<h1>Manage 2FA</h1>

<img src={img} alt="2FA QRCode" />

<br /><br /><br /><br /><br /><br /><br /><br />
{#if !img}
  <button on:click={request2FA}>Activate 2FA</button>
{:else}
  <TFAInput url="api/2fa" />
{/if}
