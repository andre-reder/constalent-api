import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'customMongoIds', async: false })
export class IsArrayOfMongoIds implements ValidatorConstraintInterface {
  validate(areas_interesse: string[], args: ValidationArguments) {
    // Verificar se o array está vazio
    if (areas_interesse.length === 0) {
      return true; // Vazio, então não há nada a validar
    }

    // Verificar se todos os elementos do array são MongoIDs válidos
    for (const id of areas_interesse) {
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return false; // Pelo menos um elemento não é um MongoID válido
      }
    }

    return true; // Todos os elementos são MongoIDs válidos
  }

  defaultMessage(args: ValidationArguments) {
    return 'O array areas_interesse deve conter apenas MongoIDs válidos ou estar vazio.';
  }
}
