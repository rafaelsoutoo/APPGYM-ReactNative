import { TouchableOpacity } from 'react-native';
import { Heading, HStack, Icon, Image, Text, VStack, Box , ScrollView, useToast } from 'native-base';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute  } from '@react-navigation/native';
import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { useEffect, useState } from 'react';


import BodySvg from '@assets/body.svg';
import SeriesSvg from '@assets/series.svg';
import RepetitionsSvg from '@assets/repetitions.svg';

import { Button } from '@components/Button';
import { Loading } from '@components/Loading';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import { ExerciseDTO } from '@dtos/ExerciseDTO';

type RouteParamsProps = {
  exerciseId: string;
}


export function Exercise() {
  const [isLoading, setIsLoading] = useState(true);
  const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);
  const [sendingRegister, setSendingRegister] = useState(false);
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  function handleGoBack() {
    navigation.goBack();
  }

  const route = useRoute();
  const toast = useToast();

  const { exerciseId } = route.params as RouteParamsProps;


  async function fetchExerciseDetails() {
    try {
      setIsLoading(true);
      const response = await api.get(`/exercises/${exerciseId}`);

      setExercise(response.data);

    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível carregar os detalhes do exercício';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      })
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchExerciseDetails();
  },[exerciseId])

  async function handleExerciseHistoryRegister() {
    try {
      setSendingRegister(true);

      await api.post('/history', { exercise_id: exerciseId });

      toast.show({
        title: 'Parabéns! Exercício registrado no seu histórico.',
        placement: 'top',
        bgColor: 'green.500'
      });

      navigation.navigate('history');
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível registrar exercício.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      })
    } finally {
      setSendingRegister(false);
    }
  }



  return (
    
    <VStack flex={1}>
      <VStack px={8} bg="gray.600" pt={12}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon 
            as={Feather}
            name="arrow-left"
            color="green.500"
            size={6}
          />
        </TouchableOpacity>
        <HStack justifyContent="space-between" mt={4} mb={8} alignItems="center">
          <Heading color="gray.100" fontSize="lg"  flexShrink={1} fontFamily="heading">
          {exercise.name}
          </Heading>

          <HStack alignItems="center">
            <BodySvg />

            <Text color="gray.200" ml={1} textTransform="capitalize">
            {exercise.group}
            </Text>
          </HStack>
        </HStack>
      </VStack>
     
      {isLoading ? <Loading /> :  
      <VStack p={8}>
      <Box rounded="lg" mb={3} overflow="hidden">
          <Image
            w="full"
            h={80}
            source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise?.demo}` }}
            alt="Nome do exercício"
            resizeMode="cover"
            rounded="lg"
          />
        </Box>
          <Box bg="gray.600" rounded="md" pb={4} px={4}>
          <HStack alignItems="center" justifyContent="space-around" mb={6} mt={5}>
            <HStack>
              <SeriesSvg />
              <Text color="gray.200" ml="2">
              {exercise.series} séries
              </Text>
            </HStack>

            <HStack>
              <RepetitionsSvg />
              <Text color="gray.200" ml="2">
              {exercise.repetitions} repetições
              </Text>
            </HStack>
          </HStack>

          <Button 
            title="Marcar como realizado"
            isLoading={sendingRegister}
            onPress={handleExerciseHistoryRegister}
          />
        </Box>
      </VStack>
     }
    </VStack>
  );
}