<!--<script lang="ts">-->
<!--  import axios from "axios";-->
<!--  import { push } from "svelte-spa-router";-->

<!--  let s: string;-->

<!--  const updateUserName = async () =>-->
<!--    axios-->
<!--      .post(-->
<!--        `${import.meta.env.VITE_BACKEND_URI}/api/user/name`,-->
<!--        { name: s },-->
<!--        {-->
<!--          withCredentials: true,-->
<!--        }-->
<!--      )-->
<!--      .then(() => push("/"))-->
<!--      .catch();-->
<!--</script>-->

<!--<h1>Manage Username</h1>-->

<!--<form on:submit|preventDefault={updateUserName} class="container">-->
<!--  <input size="32" required bind:value={s} />-->
<!--  <br />-->
<!--  <input type="submit" value="Submit" />-->
<!--</form>-->
