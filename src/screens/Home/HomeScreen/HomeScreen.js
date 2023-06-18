import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import { connect } from "react-redux";
import { Icon } from "@rneui/themed";
import { styles } from "./HomeScreen.styles";
import { equipmentList } from "../../../utils/equipmentList";
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../utils";
import { saveActualPostFirebase } from "../../../actions/post";
import { LoadingSpinner } from "../../../components/shared/LoadingSpinner/LoadingSpinner";
import { screen } from "../../../utils";
import { useNavigation } from "@react-navigation/native";
import { Image as ImageExpo } from "expo-image";
import { HeaderScreen } from "../../../components/Home";
import { EquipmentListUpper } from "../../../actions/home";

const windowWidth = Dimensions.get("window").width;

function HomeScreen(props) {
  const POSTS_PER_PAGE = 5; // Number of posts to retrieve per page

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [lengPosts, setlengPosts] = useState(POSTS_PER_PAGE);

  // this useEffect is used to retrive all data from firebase
  useEffect(() => {
    console.log("useeffect");
    let unsubscribe; // Variable to store the unsubscribe function

    async function fetchData() {
      let queryRef;
      if (props.equipmentListHeader.length > 0) {
        queryRef = query(
          collection(db, "posts"),
          where("equipoTag", "in", props.equipmentListHeader),
          limit(lengPosts),
          orderBy("createdAt", "desc")
        );
      } else {
        queryRef = query(
          collection(db, "posts"),
          limit(lengPosts),
          orderBy("createdAt", "desc")
        );
      }
      unsubscribe = onSnapshot(queryRef, (ItemFirebase) => {
        const lista = [];
        ItemFirebase.forEach((doc) => {
          lista.push(doc.data());
        });
        console.log("OnSnapshop");
        setPosts(lista);
      });
      setIsLoading(false);
    }

    fetchData();

    return () => {
      // Cleanup function to unsubscribe from the previous listener
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [props.equipmentListHeader.toString(), lengPosts]);

  //This code is for retreive code each time is updated
  const loadMorePosts = async () => {
    console.log("snapshotGETDOCS");
    setlengPosts((prevPosts) => prevPosts + POSTS_PER_PAGE);
  };

  //This function retrieve the image file to render equipments from the header horizontal bar
  const chooseImageEquipment = useCallback((tags) => {
    const result = equipmentList.find((item) => {
      return item.tag === tags;
    });
    return result?.image;
  }, []);

  //---This is used to get the attached file in the post that contain an attached file---
  const uploadFile = useCallback(async (uri) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        alert("Unable to open PDF document");
      }
    } catch (error) {
      alert("Error opening PDF document", error);
    }
  }, []);

  //----this goes to another screen using the params given in this screen, useCallBack---
  const selectAsset = useCallback(
    (item) => {
      navigation.navigate(screen.search.tab, {
        screen: screen.search.item,
        params: { Item: item },
      });
    },
    [navigation]
  );

  //---activate like/unlike Post using useCallback--------
  const likePost = useCallback(
    async (item) => {
      const postRef = doc(db, "posts", item.idDocFirestoreDB);

      if (item.likes.includes(props.email)) {
        await updateDoc(postRef, {
          likes: arrayRemove(props.email),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(props.email),
        });
      }
    },
    [props.email]
  );

  //--To goes to comment screen using callBack-----
  const commentPost = useCallback(
    (item) => {
      navigation.navigate(screen.home.tab, {
        screen: screen.home.comment,
        params: { Item: item },
      });
    },
    [navigation]
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else {
    return (
      <>
        {console.log("renderHome111")}
        <Text></Text>
        <HeaderScreen />
        <Text></Text>
        <FlatList
          data={posts}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{
                  margin: 2,
                  borderBottomWidth: 5,
                  borderBottomColor: "white",
                }}
              >
                <View style={[styles.row, styles.center]}>
                  <View style={[styles.row, styles.center]}>
                    <TouchableOpacity
                      onPress={() => selectAsset(item.equipoPostDatos)}
                      style={[styles.row, styles.center]}
                    >
                      <ImageExpo
                        source={chooseImageEquipment(item.equipoPostDatos?.tag)}
                        style={styles.roundImage}
                        cachePolicy={"memory-disk"}
                      />
                      <Text>{item.equipoPostDatos?.tag}</Text>
                    </TouchableOpacity>

                    <ImageExpo
                      source={{ uri: item.fotoUsuarioPerfil }}
                      style={styles.roundImage}
                      cachePolicy={"memory-disk"}
                    />
                    <Text>{item.nombrePerfil}</Text>
                  </View>
                </View>
                <View style={[styles.row, styles.center]}>
                  <Text style={{ margin: 5, color: "#5B5B5B" }}>
                    {"Fecha:  "}
                    {item.fechaPostFormato}
                  </Text>
                  {item.pdfPrincipal && (
                    <TouchableOpacity
                      onPress={() => uploadFile(item.pdfPrincipal)}
                    >
                      <Icon type="material-community" name="paperclip" />
                      <Text>Archivo Adjunto</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.equipments}>
                  <TouchableOpacity onPress={() => commentPost(item)}>
                    <ImageExpo
                      source={{ uri: item.fotoPrincipal }}
                      style={styles.postPhoto}
                      cachePolicy={"memory-disk"}
                    />
                  </TouchableOpacity>

                  <View>
                    <Text style={styles.textAreaTitle}>{item.titulo}</Text>
                    <Text style={styles.textAreaComment}>
                      {item.comentarios}
                    </Text>
                    <Text style={styles.textAreaTitleplus}>
                      Datos Adicionales:{" "}
                    </Text>
                    <Text style={styles.textAreaCommentplus}>
                      {"Etapa del evento:"}
                      {item.etapa}
                    </Text>
                    <Text style={styles.textAreaCommentplus}>
                      {"Componente:"}
                      {item.nombreComponente}
                    </Text>
                    <Text style={styles.textAreaCommentplus}>
                      {"Datos Clave:"}
                      {item.tipo}
                    </Text>

                    <Text style={styles.textAreaCommentplus}>
                      {"Recursos:"}
                      {item.recursos}
                    </Text>
                  </View>
                </View>
                <View style={styles.rowlikes}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: windowWidth * 0.35,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => likePost(item)}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Icon
                        type="material-community"
                        name={
                          item.likes.includes(props.email)
                            ? "thumb-up"
                            : "thumb-up-outline"
                        }
                      />

                      <Text> {item.likes.length} Revisado</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => commentPost(item)}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Icon
                        type="material-community"
                        name="comment-processing-outline"
                      />

                      <Text>
                        {" "}
                        {item.comentariosUsuarios.length} Comentarios
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          keyExtractor={(item) => item.fotoPrincipal} // Provide a unique key for each item
          onEndReached={() => loadMorePosts()}
          onEndReachedThreshold={0.1}
        />
      </>
    );
  }
}

const mapStateToProps = (reducers) => {
  return {
    ActualPostFirebase: reducers.post.ActualPostFirebase,
    firebase_user_name: reducers.profile.firebase_user_name,
    user_photo: reducers.profile.user_photo,
    email: reducers.profile.email,
    profile: reducers.profile.profile,
    uid: reducers.profile.uid,
    equipmentListHeader: reducers.home.equipmentList,
  };
};

export const ConnectedHomeScreen = connect(mapStateToProps, {
  saveActualPostFirebase,
  EquipmentListUpper,
})(HomeScreen);
