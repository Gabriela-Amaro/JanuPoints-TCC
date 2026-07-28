import React from "react";
import {
  ActivityIndicator,
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/Colors";
import { styles } from "./styles";

export interface AccountFieldProps {
  /** Rótulo do campo (ex: Nome, Email, CPF) */
  label: string;
  /** Valor atual do input */
  value: string;
  /** Callback ao alterar o texto */
  onChangeText?: (text: string) => void;
  /** Placeholder opcional */
  placeholder?: string;
  /** Se false, o campo fica desabilitado (ex: CPF) */
  editable?: boolean;
  /** Se true, o botão "Salvar" inline será exibido */
  isModified?: boolean;
  /** Indica se está salvando o campo no momento */
  isLoading?: boolean;
  /** Callback acionado ao clicar no botão "Salvar" */
  onSave?: () => void;
  /** Tipo de teclado */
  keyboardType?: KeyboardTypeOptions;
  /** Auto capitalização */
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  /** Comprimento máximo do texto */
  maxLength?: number;
}

/**
 * Componente reutilizável de campo de conta com suporte a botão de salvamento inline.
 */
export function AccountField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  isModified = false,
  isLoading = false,
  onSave,
  keyboardType,
  autoCapitalize,
  maxLength,
}: AccountFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            !editable && styles.inputDisabled,
            editable && isModified && styles.inputWithSave,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[500]}
          editable={editable}
          selectTextOnFocus={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          maxLength={maxLength}
        />

        {editable && isModified && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSave}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
