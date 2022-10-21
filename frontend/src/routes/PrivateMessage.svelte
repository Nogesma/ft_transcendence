<script lang="ts">
  import { getUserInfo } from "../utils/info.js";
  import ProfilePic from "../lib/ProfilePic.svelte";
  import {
    privateMessages,
    pmSocket,
    pendingPM,
    blocks,
    login,
    displayname,
    id,
    invite,
  } from "../stores/settings.js";
  import Modal from "../lib/Modal.svelte";
  import axios from "axios";
  import { isEmpty } from "ramda";
  import Promise from "bluebird";

  import { params, push } from "svelte-spa-router";
  import type { MessageList } from "../chat";
  import Messages from "../lib/Messages.svelte";
  import { acceptInvite, sendInvite } from "../utils/gameInvite";

  $: selectedPmId = Number($params?.pmId ?? -1);

  let newPmName = "";
  let error = "";

  const getUserId = (name: string) =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/info/id/${name}`, {
        withCredentials: true,
      })
      .then(({ data }) => data as number)
      .catch(() => {
        error = "User does not exist";
        return -1;
      });

  const sendPrivateMessage = (message: string) => {
    if (!message || message.length === 0) return;

    $privateMessages
      .get(selectedPmId)
      ?.push({ message, login: $login, displayname: $displayname, id: $id });
    $privateMessages = $privateMessages;

    $pmSocket.emit("sendMessage", { id: selectedPmId, message });
  };

  $: if ($pendingPM > 0) $pendingPM = 0;

  let currentPm: MessageList | undefined;
  $: {
    currentPm = $privateMessages.get(selectedPmId);

    if (selectedPmId !== -1 && !currentPm) {
      $privateMessages.set(selectedPmId, []);
      currentPm = $privateMessages.get(selectedPmId);
      $privateMessages = $privateMessages;
    }
  }

  let userInfo = new Map<number, { login: string; displayname: string }>();

  privateMessages.subscribe((value) =>
    Promise.each(
      value,
      async ([key, value]: [key: number, value: MessageList]) => {
        // we need this because typescript doesn't like it when we only get [key]
        // as argument.
        value;

        if (userInfo.has(key)) return;
        userInfo.set(
          key,
          (await getUserInfo(key)) as { login: string; displayname: string }
        );
      }
    ).then(() => (userInfo = userInfo))
  );

  $: if ($blocks.has(selectedPmId)) push("/pm");

  let checkbox: HTMLInputElement;

  $: acceptInviteC = acceptInvite($pmSocket, String(selectedPmId));
  $: sendInviteC = sendInvite($pmSocket, String(selectedPmId));

  let message = "";
</script>

<div class="flex h-full">
  <div class="flex flex-row flex-auto w-full">
    <ul class="menu bg-base-200 w-1/6 rounded m-2 overflow-hidden">
      <li class="rounded">
        <label for="newpm-modal" class="modal-button">New private message</label
        >
      </li>
      {#each [...userInfo] as [id, { login, displayname }]}
        {#if !$blocks.has(id)}
          <li class="rounded {id === selectedPmId ? 'bordered' : ''}">
            <button on:click={() => push(`/pm/${id}`)}>
              <div class="avatar h-10 w-10">
                <ProfilePic user={login} attributes="rounded-full" />
              </div>
              {displayname}
            </button>
          </li>
        {/if}
      {/each}
    </ul>
    <div class="flex flex-auto flex-col w-2/3 m-2 bg-base-300 rounded">
      {#if currentPm}
        <Messages
          messagesList={currentPm}
          p={true}
          invite={$invite.get(selectedPmId)}
          acceptInvite={acceptInviteC}
        />

        <div class="flex content-center gap-4">
          <form
            class="form-control self-center"
            on:submit|preventDefault={() => {
              sendPrivateMessage(message);
              message = "";
            }}
          >
            <label class="input-group">
              <input
                type="text"
                bind:value={message}
                class="input input-bordered"
              />
              <button class="btn btn-primary" type="submit">Send</button>
            </label>
          </form>

          <button class="btn w-24 m-1" on:click={() => sendInviteC(false)}>
            classic</button
          >
          <button class="btn w-24 m-1" on:click={() => sendInviteC(true)}>
            modified</button
          >
        </div>
      {:else}
        <div
          class="flex flex-auto items-center justify-center text-5xl font-bold"
        >
          <div class="flex h-min">Select or create a new chat.</div>
        </div>
      {/if}
    </div>
  </div>
</div>

<Modal bind:inputElement={checkbox} id="newpm-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">New private message</h3>

      {#if !isEmpty(error)}
        <div class="alert alert-error shadow-lg mt-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
            <span>{error}</span>
          </div>
        </div>
      {/if}
      <div class="flex-col flex space-y-4">
        <div class="form-control mt-4">
          <label class="input-group">
            <span>Name</span>
            <input
              bind:value={newPmName}
              type="text"
              placeholder=""
              class="input input-bordered flex-auto"
            />
          </label>
        </div>
        <label
          for="join-modal"
          class="btn btn-active btn-primary {isEmpty(newPmName)
            ? 'btn-disabled'
            : ''}"
          on:click={async () => {
            const id = await getUserId(newPmName);

            if (id !== -1) {
              if (!$privateMessages.has(id)) {
                $privateMessages.set(id, []);
                $privateMessages = $privateMessages;
              }
              checkbox.checked = false;
            }
          }}
          on:keypress={async () => {
            const id = await getUserId(newPmName);

            if (id !== -1) {
              if (!$privateMessages.has(id)) {
                $privateMessages.set(id, []);
                $privateMessages = $privateMessages;
              }
              checkbox.checked = false;
            }
          }}>Select</label
        >
      </div>
    </div>
  </svelte:fragment>
</Modal>
