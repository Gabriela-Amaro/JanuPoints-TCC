import { StyleSheet } from "react-native";
import { colors } from "../../../constants/Colors";
import { FontFamily, FontSize } from "../../../constants/Fonts";

export const styles = StyleSheet.create({
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLabel: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.medium,
    color: colors.brown[800],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  headerPoints: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.brown[800],
  },
  content: {
    flex: 1,
    padding: 20,
  },
  helperText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.brown[800],
  },
  tabText: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    color: colors.gray[700],
  },
  tabTextActive: {
    color: colors.white,
    fontFamily: FontFamily.bold,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgePendingText: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.bold,
    color: colors.warning,
  },
  badgeFinished: {
    backgroundColor: colors.brown[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeFinishedText: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.bold,
    color: colors.brown[800],
  },
  emptySectionCard: {
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptySectionText: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[500],
  },
  card: {
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.bold,
    color: colors.textPrimary,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  storeLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  storeLogoPlaceholder: {
    backgroundColor: colors.brown[400],
    justifyContent: "center",
    alignItems: "center",
  },
  storeLogoText: {
    fontSize: 10,
    fontFamily: FontFamily.bold,
    color: colors.white,
  },
  storeName: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    flex: 1,
  },
  points: {
    fontSize: FontSize.description,
    fontFamily: FontFamily.bold,
    textAlign: "right",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    marginTop: 14,
    paddingTop: 10,
  },
  date: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
  },
  status: {
    fontSize: FontSize.small,
    fontFamily: FontFamily.bold,
  },
  emptyText: {
    fontSize: FontSize.body,
    fontFamily: FontFamily.regular,
    color: colors.gray[700],
    textAlign: "center",
    marginTop: 48,
  },
});
