import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Pressable,
  Linking,
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import { styles } from "./ItemScreen.styles";
import { SearchBar, Icon, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { equipmentList } from "../../../utils/equipmentList";
import { db } from "../../../utils";
import { screen } from "../../../utils";
import { getExcelEquipo } from "../../../utils/excelData";
import { connect } from "react-redux";
import { saveActualEquipment } from "../../../actions/post";
import { EquipmentListUpper } from "../../../actions/home";
import { DateScreen } from "../../../components/Post/DateScreen/DateScreen";

const windowWidth = Dimensions.get("window").width;
function ItemScreenNotRedux(props) {
  console.log("itemScreen");
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreEquipmentLiked, setFirestoreEquipmentLiked] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [removeFilter, setRemoveFilter] = useState(true);
  //Retrieve data Item that comes from the previous screen

  const {
    route: {
      params: { Item },
    },
  } = props;
  const navigation = useNavigation();

  //Changing the value to activate again the filter to rende the posts
  const filter = (start, end) => {
    console.log("filter");
    setStartDate(start);
    setEndDate(end);
  };
  const quitfilter = () => {
    setRemoveFilter((prev) => !prev);
    setStartDate(null);
    setEndDate(null);
    console.log("removeFilter");
  };

  //Using navigation.navigate I send it to another screen (post)
  const goToPublicar = () => {
    props.saveActualEquipment(Item);

    navigation.navigate(screen.post.tab, {
      screen: screen.post.camera,
      params: { Item: Item },
    });
  };

  //This function is used to retrive the image file to the icon
  function chooseImageEquipment(tags) {
    const result = equipmentList.find((item) => {
      return item.tag == tags;
    });
    return result.image;
  }

  //This hook used to retrieve post data from Firebase and sorted by date
  useEffect(() => {
    let unsubscribe;
    let q;
    async function fetchData() {
      if (startDate && endDate) {
        q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          where("equipoTag", "==", Item.tag),
          where("createdAt", ">=", startDate),
          where("createdAt", "<=", endDate)
        );
      } else {
        console.log("removeFilter");
        q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          where("equipoTag", "==", Item.tag),
          limit(10) // Add the desired limit value here
        );
      }
      try {
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push(doc.data());
        });
        console.log("getDocs Item with date");

        setPost(lista);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      // Unsubscribe from the previous listener when the component is unmounted or when the dependencies change
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [startDate, endDate, removeFilter]);

  //this hook is used to render the boton (seguir/siguiendo) and send to globalState (home=>equipmentList)
  useEffect(() => {
    let unsubscribe;

    async function fetchEquipmentData() {
      const q = query(collection(db, "users"), where("uid", "==", props.uid));

      unsubscribe = onSnapshot(q, (itemFirebase) => {
        itemFirebase.forEach((doc) => {
          setFirestoreEquipmentLiked(doc.data().EquipmentFavorities);
          props.EquipmentListUpper(doc.data().EquipmentFavorities);
        });
      });
    }
    fetchEquipmentData();
    return () => {
      // Unsubscribe from the previous listener when the component is unmounted or when the dependencies change
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  //this function add/remove to firebase Users Collection => EquipmentFavorities
  const pressFollow = async () => {
    const PostRef = doc(db, "users", props.uid);
    if (firestoreEquipmentLiked?.includes(Item.tag)) {
      await updateDoc(PostRef, {
        EquipmentFavorities: arrayRemove(Item.tag),
      });
    } else {
      await updateDoc(PostRef, {
        EquipmentFavorities: arrayUnion(Item.tag),
      });
    }
  };

  //this function goes to homeTab=>commentScreen
  const comentPost = (item) => {
    navigation.navigate(screen.home.tab, {
      screen: screen.home.comment,
      params: { Item: item },
    });
  };

  //this function goes to PolinesScreen
  const polinesDetail = () => {
    navigation.navigate(screen.search.polines, {
      dataReport: Item,
    });
  };

  //This is used to get the attached file in the post that contain an attached file
  async function UploadFile(uri) {
    Linking.canOpenURL(uri)
      .then((supported) => {
        if (supported) {
          Linking.openURL(uri);
        } else {
          alert("Unable to open PDF document");
        }
      })
      .catch((error) => alert("Error opening PDF document", error));
  }

  return (
    <>
      <View style={[styles.row, styles.center]}>
        <View>
          <Image
            source={chooseImageEquipment(props.route.params.Item.tag)}
            style={styles.roundImage}
          />
          {firestoreEquipmentLiked?.includes(Item.tag) ? (
            <Pressable
              style={styles.buttonFollow}
              onPress={() => pressFollow()}
            >
              <Text style={styles.textFollow}>Siguiendo</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.buttonUnfollow}
              onPress={() => pressFollow()}
            >
              <Text style={styles.textFollow}>Seguir</Text>
            </Pressable>
          )}
        </View>
        <View>
          <Text></Text>
          <Text style={styles.name}>{Item.tag}</Text>
          <Text style={styles.info}>
            {"Nombre:  "} {Item.nombre}
          </Text>
          <Text style={styles.info}>
            {"Marca:  "} {Item.marca}
          </Text>
          <Text style={styles.info}>
            {"Tonelaje:  "} {Item.tonelaje}
          </Text>
          <Text style={styles.info}>
            {"Tamano:  "} {Item.tamano}
          </Text>

          <Text style={styles.info}>
            {"Caracteristica:  "} {Item.caracteristicas}
          </Text>
          <Text style={styles.info}>
            {"Datos Adicionales:  "} {Item.datos_adicionales}
          </Text>
        </View>
      </View>

      <Text></Text>
      {Item.clase == "faja" ? (
        <Button
          title="Estado de los Polines"
          buttonStyle={styles.btnActualizarStyles}
          titleStyle={styles.btnTextStyle}
          onPress={polinesDetail}
        />
      ) : null}
      <DateScreen filterButton={filter} quitFilterButton={() => quitfilter()} />

      <FlatList
        data={post}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => comentPost(item)}>
              <View />
              <View>
                <View style={styles.equipments2}>
                  <ImageExpo
                    source={{ uri: item.fotoPrincipal }}
                    style={styles.image2}
                    cachePolicy={"memory-disk"}
                  />
                  <View>
                    <Text style={styles.name2}>{item.titulo}</Text>
                    <Text style={styles.info2}>{item.comentarios}</Text>
                    <Text style={styles.info2}>{item.fechaPostFormato}</Text>
                  </View>
                  {item.pdfPrincipal && (
                    <TouchableOpacity
                      onPress={() => UploadFile(item.pdfPrincipal)}
                      style={styles.attachedElement}
                    >
                      <Icon type="material-community" name="paperclip" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.fotoPrincipal} // Provide a unique key for each item
      />
      <Icon
        reverse
        type="material-community"
        name="plus-circle-outline"
        color="#8CBBF1"
        containerStyle={styles.btnContainer2}
        onPress={() => goToPublicar(Item.tag)}
      />
      <Icon
        reverse
        type="material-community"
        name="file-excel"
        color="#8CBBF1"
        containerStyle={styles.btnContainer3}
        onPress={() => getExcelEquipo(Item.tag)}
      />
    </>
  );
}

const mapStateToProps = (reducers) => {
  return {
    profile: reducers.profile.firebase_user_name,
    user_photo: reducers.profile.user_photo,
    savePhotoUri: reducers.post.savePhotoUri,
    actualEquipment: reducers.post.actualEquipment,
    uid: reducers.profile.uid,
    equipmentListHeader: reducers.home.equipmentList,
  };
};

export const ItemScreen = connect(mapStateToProps, {
  saveActualEquipment,
  EquipmentListUpper,
})(ItemScreenNotRedux);
