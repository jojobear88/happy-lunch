/* eslint-disable jsx-a11y/label-has-associated-control */
import ProfilePicture from '@app/assets/profile-picture.png'
import { LoadingScreen } from '@app/components/Suspense'
import { getHomeDataByUid } from '@app/libs/api/home'
import { getUserByUid } from '@app/libs/api/userAPI'
import { auth } from '@app/server/firebase'
import { User } from '@app/server/firebaseType'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { clearNotiList } from '@app/stores/noti'
import { clearUser, idle, updateUserInfo, userStatus, userStore } from '@app/stores/user'
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp'
import LogoutIcon from '@mui/icons-material/Logout'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import ReplyIcon from '@mui/icons-material/Reply'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import { Container } from '@mui/system'
import { signOut } from 'firebase/auth'
import { Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'

const Profile = () => {
  const loginUser = useAppSelector(userStore)
  const status = useAppSelector(userStatus)
  const dispatch = useAppDispatch()
  const [showMessage, setShowMessage] = useState<'success' | 'error' | null>(null)
  const [currentMember, setCurrentMember] = useState<User>()
  const [loading, setLoading] = useState<boolean>(false)

  const { userUid } = useParams()

  //state for images
  const [imgQRPreview, setImgQRPreview] = useState(loginUser?.qrCodeURL)
  const [imgObj, setImgObj] = useState<any>(null)

  const [imgAvatarPreview, setImgAvatarPreview] = useState(loginUser?.photoURL)
  const [imgAvatarObj, setImgAvatarObj] = useState<any>(null)

  const [listEvent, setListEvent] = useState<any>({})
  const isLoginUser = currentMember?.uid === loginUser.uid
  const userFormData = useMemo(() => (isLoginUser ? loginUser : currentMember), [loginUser, isLoginUser, currentMember])

  const getCurrentMemberInfo = async () => {
    try {
      setLoading(true)
      const memberInfo = await getUserByUid(userUid!)
      setCurrentMember(memberInfo)
      setLoading(false)
    } catch (e) {
      setLoading(false)
      console.log('Error when get member', e)
    }
  }

  useEffect(() => {
    getCurrentMemberInfo()
  }, [])

  //Handle QR Image
  useEffect(() => {
    return () => {
      if (imgQRPreview) {
        URL.revokeObjectURL(imgQRPreview)
      }
    }
  }, [imgQRPreview])

  const handlePreviewQRChange = (event: any) => {
    const fileUploaded = event.target ? event.target.files[0] : null
    if (fileUploaded) {
      setImgObj(fileUploaded)
      setImgQRPreview(URL.createObjectURL(fileUploaded))
    }
  }

  useEffect(() => {
    setImgQRPreview(loginUser?.qrCodeURL)
  }, [loginUser])

  //Handle User Avatar Image
  useEffect(() => {
    return () => {
      if (imgAvatarPreview) {
        URL.revokeObjectURL(imgAvatarPreview)
      }
    }
  }, [imgAvatarPreview])

  const handlePreviewAvatarChange = (event: any) => {
    const fileUploaded = event.target ? event.target.files[0] : null
    if (fileUploaded) {
      setImgAvatarObj(fileUploaded)
      setImgAvatarPreview(URL.createObjectURL(fileUploaded))
    }
  }

  useEffect(() => {
    setImgAvatarPreview(loginUser?.photoURL)
  }, [loginUser])

  //--------------------------------------

  useEffect(() => {
    getHomeDataByUid(loginUser?.uid || '').then((e) => {
      setListEvent(e)
    })
  }, [dispatch, loginUser?.uid])

  useEffect(() => {
    if (status === 'succeeded') {
      setShowMessage('success')
    } else if (status === 'failed') {
      setShowMessage('error')
    }
  }, [status])

  const logout = async () => {
    try {
      await signOut(auth).then(() => {
        dispatch(clearUser())
        dispatch(clearNotiList())
      })
    } catch (error) {
      console.log('ERROR LOGGING OUT', error)
    }
  }

  const handleCloseMessage = () => {
    dispatch(idle())
    setShowMessage(null)
  }
  const handleSubmitMember = async (formValues: any) => {
    try {
      setLoading(true)
      await dispatch(updateUserInfo(loginUser.uid as string, formValues, imgObj, imgAvatarObj))
      await getCurrentMemberInfo()
      setLoading(false)
    } catch (e) {
      setLoading(false)
      console.log('Error when update member', e)
    }
  }

  // Form validation
  const validationSchema = yup.object().shape({
    name: yup.string().required('Vui l??ng nh???p t??n').max(30, 'T??n kh??ng ???????c qu?? 30 k?? t???'),
    ldapAcc: yup.string().max(10, 'LDAP kh??ng qu?? 10 k?? t???'),
    phone: yup
      .string()
      .matches(/^[0-9]*$/, 'S??? ??i???n tho???i kh??ng ???????c c?? k?? t???')
      .max(20, 'S??? ??i???n tho???i kh??ng qu?? 20 s???'),
    address: yup.string().max(50, '?????a ch??? kh??ng qu?? 50 k?? t???'),
    bankName: yup.string().required('Vui l??ng nh???p t??n ng??n h??ng').max(30, 'T??n ng??n h??ng kh??ng ???????c qu?? 30 k?? t???'),
    bankAccountName: yup.string().required('Vui l??ng nh???p t??n').max(30, 'T??n kh??ng ???????c qu?? 30 k?? t???'),
    bankAccount: yup.string().required('Vui l??ng nh???p s??? t??i kho???n').max(20, 'S??? t??i kho???n kh??ng ???????c qu?? 20 k?? t???'),
  })

  function isInvalidForm(errors: any) {
    return errors.name || errors.bankAccount || errors.bankName || errors.bankAccountName
  }

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="min-h-screen bg-white">
          <div className="bg-gradient-to-b from-[#CAF5B1] to-[#8AD769] ">
            <Container>
              <div className="h-72 rounded-b-2xl flex flex-col items-center justify-center">
                <div className="flex justify-between self-stretch">
                  <button className="px-4">
                    <ReplyIcon
                      onClick={() => {
                        history.back()
                      }}
                      fontSize={'large'}
                    />
                  </button>
                  {isLoginUser && (
                    <button className="px-4" onClick={logout}>
                      <LogoutIcon fontSize={'large'} />
                    </button>
                  )}
                </div>
                {isLoginUser ? (
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton color="primary" aria-label="upload picture" component="label" onChange={handlePreviewAvatarChange}>
                        <input hidden accept="image/*" type="file" />
                        <div className="bg-white w-[40px] h-[40px] rounded-full">
                          <AccountCircleSharpIcon sx={{ width: 40, height: 40 }} />
                        </div>
                      </IconButton>
                    }
                  >
                    <Avatar alt="avatar" src={imgAvatarPreview ? imgAvatarPreview : ProfilePicture} sx={{ width: 120, height: 120 }} />
                  </Badge>
                ) : (
                  <Avatar alt="avatar" src={currentMember?.photoURL || ''} sx={{ width: 120, height: 120 }} />
                )}
                <span className="py-2 text-xl">{currentMember?.name || ''}</span>
                <span className="pt-2 text-md">
                  <span className="font-bellota">Ch??? chi</span>: <span className="font-bold">{listEvent.isHostCount} l???n</span> |
                  <span className="font-bellota"> Tham gia</span>: <span className="font-bold">{listEvent.isMemberCount} l???n</span>
                </span>
              </div>
            </Container>
          </div>
          <div className="px-6 py-4">
            <Formik
              initialValues={{ ...userFormData }}
              onSubmit={(values) => {
                handleSubmitMember(values)
              }}
              validationSchema={validationSchema}
            >
              {({ values, handleChange, handleBlur, handleSubmit, errors }) => (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <TextField
                    label="T??n hi???n th???"
                    variant="standard"
                    fullWidth={true}
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!isLoginUser}
                    helperText={errors.name || ''}
                    error={Boolean(errors.name)}
                  />
                  <TextField
                    label="LDAP"
                    variant="standard"
                    fullWidth={true}
                    id="ldapAcc"
                    name="ldapAcc"
                    value={values.ldapAcc}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!isLoginUser}
                    helperText={errors.ldapAcc || ''}
                    error={Boolean(errors.ldapAcc)}
                  />

                  <TextField
                    label="??i???n tho???i"
                    variant="standard"
                    fullWidth={true}
                    id="phone"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!isLoginUser}
                    helperText={errors.phone || ''}
                    error={Boolean(errors.phone)}
                  />
                  <TextField
                    label="?????a ch???"
                    variant="standard"
                    fullWidth={true}
                    id="address"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    disabled={!isLoginUser}
                    onBlur={handleBlur}
                    helperText={errors.address || ''}
                    error={Boolean(errors.address)}
                  />
                  <TextField
                    label="Ng??n h??ng"
                    variant="standard"
                    fullWidth={true}
                    id="bankName"
                    name="bankName"
                    value={values.bankName}
                    onChange={handleChange}
                    disabled={!isLoginUser}
                    onBlur={handleBlur}
                    helperText={errors.bankName || ''}
                    error={Boolean(errors.bankName)}
                  />
                  <TextField
                    label="Ch??? t??i kho???n"
                    variant="standard"
                    fullWidth={true}
                    id="bankAccountName"
                    name="bankAccountName"
                    value={values.bankAccountName}
                    onChange={handleChange}
                    disabled={!isLoginUser}
                    onBlur={handleBlur}
                    helperText={errors.bankAccountName || ''}
                    error={Boolean(errors.bankAccountName)}
                  />
                  <TextField
                    label="S??? t??i kho???n"
                    variant="standard"
                    fullWidth={true}
                    id="bankAccount"
                    name="bankAccount"
                    value={values.bankAccount}
                    onChange={handleChange}
                    disabled={!isLoginUser}
                    onBlur={handleBlur}
                    helperText={errors.bankAccount || ''}
                    error={Boolean(errors.bankAccount)}
                  />
                  <div className="flex flex-col pb-8">
                    <span className="font-bellota text-sm">M?? QR</span>
                    <div className="self-center pt-3">
                      {isLoginUser && imgQRPreview && <img alt="qrcode" className="max-w-xs" src={imgQRPreview} />}
                      {!isLoginUser && currentMember?.qrCodeURL && <img src={currentMember?.qrCodeURL} className="max-w-xs" alt="qrcode" />}
                    </div>
                    {isLoginUser && (
                      <>
                        <IconButton size={'large'} color="primary" aria-label="upload picture" component="label" onChange={handlePreviewQRChange}>
                          <input hidden accept="image/*" type="file" />
                          <PhotoCamera fontSize={'large'} />
                        </IconButton>
                        <Button variant="contained" type="submit" className="self-center" disabled={isInvalidForm(errors)}>
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              )}
            </Formik>
          </div>

          {showMessage && (
            <Snackbar open={true} onClose={handleCloseMessage} autoHideDuration={1500} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
              <Alert severity={showMessage} sx={{ width: '100%', backgroundColor: '#baf7c2' }}>
                {showMessage === 'success' ? (
                  <span className="font-bold"> {'C???p nh???t user th??nh c??ng!'} </span>
                ) : (
                  <span className="font-bold"> {'C???p nh???t th???t b???i!'} </span>
                )}
              </Alert>
            </Snackbar>
          )}
        </div>
      )}
    </>
  )
}

export default Profile
