import {toast} from "sonner";
import {useMutation} from "react-query";
import {fetchApi} from "@/lib/fetchApi";
import {useAuth0} from "@auth0/auth0-react";

type CreateUserQuery = {
  auth0Id: string;
  email: string;
  name: string;
};

export const useCreateUser = () => {
  const {getAccessTokenSilently} = useAuth0();
  const createCurrentUser = async (user: CreateUserQuery) => {
    const accessToken = await getAccessTokenSilently();
    const requestBody = {
      query: `mutation CreateCurrentUser($auth0Id:String!,$email:String!,$name:String!){
        createCurrentUser(currentUserInput:{auth0Id:$auth0Id,email:$email,name:$name}){
           _id
          auth0Id
          email
          name
        }
      }`,
      variables: {
        auth0Id: user.auth0Id,
        email: user.email,
        name: user.name,
      },
    };

    const response = await fetchApi(requestBody, accessToken);
    if (!response.ok) {
      throw new Error("Failed to create user");
    }
  };

  const {mutateAsync: createUser, isLoading} = useMutation(createCurrentUser);
  return {createUser, isLoading};
};

type UpdateCurrentUserRequest = {
  name: string;
  addressLine1: string;
  city: string;
  country: string;
};

export const useUpdateMyUser = () => {
  const {getAccessTokenSilently} = useAuth0();
  const updateCurrentUserRequest = async (
    formData: UpdateCurrentUserRequest
  ) => {
    const accessToken = await getAccessTokenSilently();
    const requestBody = {
      query: `mutation UpdateCurrentUser($name:String!,$addressLine1:String!, $city:String!, $country:String!){
        updateCurrentUser(updateUserInput:{name:$name,addressLine1:$addressLine1,
        city:$city,
          country:$country
        }){
          name
          addressLine1
          country
          city
        }
        }`,
      variables: {
        name: formData.name,
        addressLine1: formData.addressLine1,
        city: formData.city,
        country: formData.country,
      },
    };

    const response = await fetchApi(requestBody, accessToken);
    if (!response.ok) {
      throw new Error("Unable to update user data");
    }
  };

  const {
    mutateAsync: updateUser,
    isLoading,
    isError,
    isSuccess,
    reset,
  } = useMutation(updateCurrentUserRequest);

  if (isSuccess) {
    toast.success("User profile updated!");
  }
  if (isError) {
    toast.error("Unable to update the profile, Please try again!");
    reset();
  }

  return {
    updateUser,
    isLoading,
  };
};
