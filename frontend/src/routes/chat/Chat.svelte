<script lang="ts">
    import {push} from "svelte-spa-router";
    import {onMount} from "svelte";
	import Axios from "axios";
    let displayName: string, profilePicture: string;
    let str:    string;
    const getUserData = async () => {
	    Axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/me`, {
		    withCredentials: true,
	    }).then(({ data }) => {
		    displayName = data.displayname;
		    profilePicture = data.image_url;
	    }).catch(() => push("#/auth/login"));
    };
	const test = async() =>
	{
		Axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/test`, {
			withCredentials: true,
		}).then(({ data }) => {
			str = data;
        });
		console.log(str);
    }
    onMount(getUserData);
	onMount(test);
</script>
<h1>{str}</h1>
<h1>Hello world</h1>