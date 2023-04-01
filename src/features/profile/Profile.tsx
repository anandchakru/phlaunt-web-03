import { Typography } from "@mui/material"
import { useAppSelector } from "../../app/hooks"
import { selectAuthUser } from "../auth/AuthSlice"

const Profile = () => {
  const authUser = useAppSelector(selectAuthUser)
  return <>
    <Typography variant="h3" component="div">
      Profile
    </Typography>
    <Typography variant="subtitle2" component="div">
      {authUser?.email}
    </Typography>
  </>
}

export default Profile