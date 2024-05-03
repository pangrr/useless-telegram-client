async function signInUser(client, apiCredentials, authParams) {
	const phoneNumber = authParams.phoneNumber;
	const sendCodeResult = await client.sendCode(apiCredentials, phoneNumber, authParams.forceSMS);
	const phoneCodeHash = sendCodeResult.phoneCodeHash;
	
	const phoneCode = authParams.phoneCode;
	const result = await client.invoke(new tl_1.Api.auth.SignIn({
			phoneNumber,
			phoneCodeHash,
			phoneCode,
	}));
	return result.user;
}