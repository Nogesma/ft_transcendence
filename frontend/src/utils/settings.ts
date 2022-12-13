import axios from "axios";
import { getUserData } from "./auth";
import QRCode from "qrcode";
import { F, inc, memoizeWith } from "ramda";
import type { Writable } from "svelte/store";

const resetAvatar = (updatepfp: Writable<number>) =>
  axios
    .delete(`${import.meta.env.VITE_BACKEND_URI}/api/user/avatar`, {
      withCredentials: true,
    })
    .then(() => updatepfp.update(inc))
    .catch(console.error);

const request2FA = async (tfa_enabled: boolean, elem: HTMLElement) => {
  if (!tfa_enabled)
    return axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/2fa/enable`, {
        withCredentials: true,
      })
      .then(async ({ data }) => {
        if (!elem.hasChildNodes())
          elem.appendChild(document.createElement("div"));
        elem.replaceChild(
          await QRCode.toCanvas(data.otpauthURL),
          elem.firstChild as Node
        );
        return null;
      })
      .catch((e) => {
        console.error(e);
        return null;
      });
  return new Promise<null>(() => null);
};

const updateUserName = async (name: string) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/user/name`,
      { name },
      {
        withCredentials: true,
      }
    )
    .then(getUserData)
    .catch(console.error);

const uploadAvatar = async (file: FileList, updatepfp: Writable<number>) => {
  const form = new FormData();
  form.append("file", file[0]);

  await axios
    .post(`${import.meta.env.VITE_BACKEND_URI}/api/user/avatar`, form, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(() => updatepfp.update(inc))
    .catch(console.error);
};

const getTFAStatus = () =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/2fa`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch(F);

const getProfilePicture = memoizeWith(String, async (u: string, def: string) =>
  axios
    .head(`/imgs/${u}.jpg`)
    .then(() => `/imgs/${u}.jpg`)
    .catch(() => def)
);

export {
  resetAvatar,
  uploadAvatar,
  updateUserName,
  request2FA,
  getTFAStatus,
  getProfilePicture,
};
