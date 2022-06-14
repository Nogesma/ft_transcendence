<script lang="ts">
  import TFAInput from "../../lib/2faInput.svelte";
  import QRCode from "qrcode";
  import axios from "axios";

  let img: string;

  const request2FA = async () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/2fa`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        const { otpauthURL } = data;

        QRCode.toDataURL(otpauthURL, function (err, data_url) {
          console.error(err);
          img = data_url;
        });
      })
      //todo: do case where user is not authenticated
      .catch();
</script>

<h1>Manage 2FA</h1>

<img src={img} alt="2FA QRCode" />

<br /><br /><br /><br /><br /><br /><br /><br />
{#if !img}
  <button on:click={request2FA}>Activate 2FA</button>
{:else}
  <TFAInput url="api/2fa" />
{/if}
