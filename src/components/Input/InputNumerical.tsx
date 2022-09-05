import { InputHTMLAttributes, useCallback } from 'react'
import { Box } from '@mui/material'
import Input, { InputProps } from './index'
import { escapeRegExp } from 'utils'
import SecondaryButton from 'components/Button/SecondaryButton'
import InputLabel from './InputLabel'
import BigNumber from 'bignumber.js'

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export default function NumericalInput({
  placeholder,
  onChange,
  maxWidth,
  onMax,
  balance,
  label,
  unit,
  endAdornment,
  subStr,
  showFormatWrapper,
  noDecimals,
  max,
  ...props
}: InputProps &
  InputHTMLAttributes<HTMLInputElement> & {
    onMax?: () => void
    balance?: string
    unit?: string
    endAdornment?: JSX.Element
    onDeposit?: () => void
    subStr?: string
    max?: string | number
    noDecimals?: boolean
    showFormatWrapper?: (() => string) | undefined
  }) {
  const enforcer = useCallback(
    (nextUserInput: string) => {
      const fixed = noDecimals ? nextUserInput.replace(/\./g, '') : nextUserInput.replace(/,/g, '.')
      console.log('🚀 ~ file: InputNumerical.tsx ~ line 40 ~ fixed', fixed)
      if (fixed === '' || inputRegex.test(escapeRegExp(fixed))) {
        return fixed
      }
      return null
    },
    [noDecimals]
  )
  const handleChange = useCallback(
    event => {
      // replace commas with periods
      let formatted = enforcer(event.target.value)
      if (formatted === null) {
        return
      }
      if (max) {
        formatted = new BigNumber(formatted).gt(max) ? max.toString() : formatted
      }
      event.target.value = formatted
      onChange && onChange(event)
    },
    [enforcer, onChange, max]
  )

  return (
    <Box sx={{ position: 'relative', maxWidth: maxWidth ?? 'unset', width: '100%' }}>
      {(label || balance) && (
        <Box display="flex" justifyContent="space-between">
          <InputLabel>{label}</InputLabel>
          <Box display="flex" alignItems="baseline">
            {!!balance && (
              <InputLabel style={{ fontSize: '12px' }}>
                Available: {balance} {unit ?? 'USDT'}
              </InputLabel>
            )}
          </Box>
        </Box>
      )}
      <Input
        {...props} // universal input options
        maxWidth={maxWidth}
        onChange={handleChange}
        inputMode="decimal"
        title=""
        autoComplete="off"
        autoCorrect="off"
        showFormatWrapper={showFormatWrapper}
        // text-specific options
        type="text"
        inputPaddingRight="0"
        pattern={noDecimals ? '^[0-9]*$' : '^[0-9]*[.,]?[0-9]*$'}
        placeholder={placeholder || '0.0'}
        minLength={1}
        maxLength={79}
        spellCheck="false"
        endAdornment={
          onMax ? (
            <Box gap="20px" display="flex" alignItems="center" paddingLeft="10px" paddingBottom="2px">
              {endAdornment ? endAdornment : unit && <span>{unit ?? 'USDT'}</span>}
              <SecondaryButton
                disabled={props.disabled === true ? true : false}
                primary
                onClick={onMax}
                style={{
                  width: '60px',
                  height: '32px'
                }}
              >
                MAX
              </SecondaryButton>
            </Box>
          ) : (
            endAdornment
          )
        }
        subStr={subStr}
      />
    </Box>
  )
}
